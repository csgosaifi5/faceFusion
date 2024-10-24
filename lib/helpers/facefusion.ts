import { handleError } from "../utils";

export async function fetchLockStatus(
  user: UserSession,
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>,
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>
) {
  const response = await fetch("/api/facefusion/manage_locks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user.clerkId,
    }),
  });
  const { data, message } = await response.json();

  if (data.facefusion.is_locked === false) {
    setIsLocked(false);
    if (data.facefusion.expiry_time) {
      const now = new Date().getTime();
      const expiryTime = new Date(data.facefusion.expiry_time).getTime();
      const timeDifferenceInSeconds = Math.floor((expiryTime - now) / 1000);
      setTimeRemaining(timeDifferenceInSeconds);

      if (timeDifferenceInSeconds === 0) {
        setIsLocked(true);
      }
    } else {
      setTimeRemaining(Infinity); // No expiry time, assume unlimited time
    }
  } else {
    setIsLocked(true);
    setTimeRemaining(0); // Locked state, timeRemaining is 0
  }
}
export async function handleUnlockApp(
  user: UserSession,
  duration: any,
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>,
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>,
  startApp: any
) {
  const response = await fetch("/api/facefusion/manage_locks", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user.clerkId,
      duration: duration,
    }),
  });
  const { data, message } = await response.json();

  if (message === "Unlocked successfully") {
    const expiryTime = new Date(data.facefusion.expiry_time).getTime(); // Convert expiry_time to milliseconds
    const unlockTime = new Date(data.facefusion.unlock_time).getTime(); // Convert unlock_time to milliseconds

    const timeDifferenceInSeconds = (expiryTime - unlockTime) / 1000;
    setTimeRemaining(duration === Infinity ? Infinity : timeDifferenceInSeconds);
    setIsLocked(false);
    startApp();
  } else {
    // setIsLocked(true);
    // setTimeRemaining(0); // Locked state, timeRemaining is 0
    handleError("Failed to unlock");
  }
}
export async function handleAddTime(
  user: UserSession,
  duration: number,
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>,
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>,
  startApp: any
) {
  const response = await fetch("/api/facefusion/manage_locks", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user.clerkId,
      duration: duration,
    }),
  });
  const { data, message } = await response.json();

  if (message === "Time added successfully") {
    const expiryTime = new Date(data.facefusion.expiry_time).getTime(); // Convert expiry_time to milliseconds
    const unlockTime = new Date(data.facefusion.unlock_time).getTime(); // Convert unlock_time to milliseconds

    const timeDifferenceInSeconds = Math.floor((expiryTime - unlockTime) / 1000);
    setTimeRemaining(duration === Infinity ? Infinity : timeDifferenceInSeconds);
    setIsLocked(false);
    startApp();
  } else {
    // setIsLocked(true);
    // setTimeRemaining(0); // Locked state, timeRemaining is 0
    handleError("Failed to unlock");
  }
}
export async function handleAppSteps(
  user: UserSession,
  setAppLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setAppStatus: React.Dispatch<React.SetStateAction<string>>,
  setAppUrl: React.Dispatch<React.SetStateAction<string>>
) {
  let attempts = 0;
  let contract_id: string | undefined;

  const waitForContractId: Promise<void> = new Promise((resolve) => {
    const tryFetch = async (attempts: number) => {
      const { error, contractId } = await (
        await fetch("/api/facefusion/steps_1to5", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.clerkId }),
        })
      ).json();
  
      if (!error || attempts >= 3) {
        // Stop retrying after a successful response or 3 failed attempts
        if (!error) {
          contract_id = contractId; // Set contract_id if successful
        }
        resolve(); // Resolve the promise
      } else {
        console.log(`Attempt ${attempts} failed, retrying...`);
        // Retry after 2 minutes
        setTimeout(() => tryFetch(attempts + 1), 2 * 60 * 1000);
      }
    };
  
    // Start the first attempt
    tryFetch(1);
  });
  
  // Await the promise
  await waitForContractId;
  

  if (contract_id === undefined) {
    return { message: "No contract ID (failed after 3 attempts)" };
  }

  console.log(contract_id);

  const VastResponse = await fetch("/api/facefusion/vast_instance", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user.clerkId,
      contract_id: contract_id,
    }),
  });
  const { data, message } = await VastResponse.json();

  console.log(message);

  await wait(60000);
  const step2Response = await fetch("/api/facefusion/steps_1to5", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.clerkId, contract_id: contract_id }),
  });

  const { error } = await step2Response.json();

  if (error) {
    await wait(60000);
    console.log("App has not started yet");
    const step2Response2ndTry = await fetch("/api/facefusion/steps_1to5", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.clerkId, contract_id: contract_id }),
    });
    const { error } = await step2Response2ndTry.json();
    if (error) {
      console.log(error);
      return;
    }
    // We have to start app before moving forward to step3_4_5Response api
  }

  const step3_4_5Response = await fetch("/api/facefusion/steps_1to5", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.clerkId, contract_id: contract_id }),
  });

  const step3_4_5Data = await step3_4_5Response.json();

  const step6Response = await fetch("/api/facefusion/step_6and7", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: user.clerkId,
      managerId: step3_4_5Data.managerId,
      sessionId: step3_4_5Data.sessionId,
    }),
  });

  const step6Data = await step6Response.json();

  console.log(step6Data);

  await wait(4 * 60 * 1000);

  const fetchStep7Logs = async () => {
    try {
      let publicUrl = null;

      while (!publicUrl) {
        const step7Response = await fetch("/api/facefusion/step_6and7", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.clerkId,
            managerId: step3_4_5Data.managerId,
            sessionId: step3_4_5Data.sessionId,
          }),
        });

        const step7Data = await step7Response.json();

        if (step7Data.data && step7Data.message === "Logs fetched") {
          const urlPattern = /public URL:\s*(https?:\/\/[^\s]+)/g;
          const matches = step7Data.data.logs.match(urlPattern);

          if (matches) {
            // Extract the URL part from the match
            publicUrl = matches[0].replace("public URL: ", "");
            console.log(publicUrl); // Logs the extracted public URL
          }

          if (publicUrl) {
            console.log("URLs found:", publicUrl);
            setAppUrl(publicUrl);
            setAppStatus("App Started");
            setAppLoading(false);
            break; // Exit loop if URLs are found
          } else {
            console.log("No URLs found. Retrying in 1 minute...");
          }
        }

        // Wait for 1 minute before making the next request
        await wait(60 * 1000);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setAppStatus("Error fetching app URL");
      setAppLoading(false);
    }
  };

  // Call the function to start fetching logs
  fetchStep7Logs();
}

export async function destroyVastInstance(user: UserSession) {
  const destroyApi = await fetch("/api/facefusion/vast_instance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user.clerkId,
    }),
  });
  const { data, message } = await destroyApi.json();
  console.log(message);
}

// Helper function to wait for a specified time (in milliseconds)
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

//ENCODER
export const encodeCredentials = (username: string, password: string) => {
  return "Basic " + btoa(`${username}:${password}`);
};
