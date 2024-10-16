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
    const intervalId = setInterval(async () => {
      attempts++;

      const { error, contractId } = await (
        await fetch("/api/facefusion/steps_1to5", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.clerkId }),
        })
      ).json();

      if (!error || attempts >= 3) {
        clearInterval(intervalId);
        if (!error) {
          contract_id = contractId;
        }
        resolve(); // Resolve promise after either success or 3 failed attempts
      } else {
        console.log(`Attempt ${attempts} failed, retrying...`);
      }
    }, 15000);
  });

  await waitForContractId;

  if (contract_id === undefined) {
    return { message: "No contract ID (failed after 3 attempts)" };
  }
  await wait(20000);
  const step2Response = await fetch("/api/facefusion/steps_1to5", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.clerkId, contract_id: contract_id }),
  });

  const { error, data, message } = await step2Response.json();

  if (error) {
    console.log(error);
    return;
  }
  if (!data.started) {
    console.log("App has not started yet");
    // We have to start app before moving forward to step3_4_5Response api
  }

  const step3_4_5Response = await fetch("/api/facefusion/steps_1to5", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.clerkId, contract_id: contract_id }),
  });

  const step3_4_5Data = await step3_4_5Response.json();

  const step6Response = await fetch("/api/facefusion/steps_6and7", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: user.clerkId,
      managerId: step3_4_5Data.managerId,
      sessionId: step3_4_5Data.sessionId,
    }),
  });

  const step7Response = await fetch("/api/facefusion/steps_6and7", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: user.clerkId,
      managerId: step3_4_5Data.managerId,
      sessionId: step3_4_5Data.sessionId,
    }),
  });


  const step7Data = await step7Response.json();
  
  if (step7Data.data && message === "Logs fetched") {
    setAppStatus("App Started");

    // We have to find app url from step7Data.data using regex
    const AppUrl: string = step7Data.data.regex;
    setAppUrl(AppUrl);
    setAppLoading(false);
  }
}

// Helper function to wait for a specified time (in milliseconds)
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

//ENCODER
export const encodeCredentials = (username: string, password: string) => {
  return "Basic " + btoa(`${username}:${password}`);
};
