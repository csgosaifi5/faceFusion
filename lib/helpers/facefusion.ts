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
    if (data.expiry_time) {
      const now = new Date().getTime();
      const expiryTime = new Date(data.expiry_time).getTime();
      const timeDifferenceInSeconds =Math.floor((expiryTime - now) / 1000);
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

    const timeDifferenceInSeconds =Math.floor((expiryTime - unlockTime) / 1000); 
    setTimeRemaining(duration === Infinity ? Infinity : timeDifferenceInSeconds);
    setIsLocked(false);
    startApp();
  } else {
    // setIsLocked(true);
    // setTimeRemaining(0); // Locked state, timeRemaining is 0
    handleError("Failed to unlock");
  }
}

// Helper function to wait for a specified time (in milliseconds)
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

//ENCODER 
export const encodeCredentials = (username:string, password:string) => {
  return 'Basic ' + btoa(`${username}:${password}`);
};