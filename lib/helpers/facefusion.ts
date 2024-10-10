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

  if (data.is_locked === false) {
    setIsLocked(false);
    if (data.expiry_time) {
      const now = new Date().getTime();
      const expiry = new Date(data.expiry_time).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
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
  startApp:any
) {
  const response = await fetch("/api/facefusion/manage_locks", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: user.clerkId,
      duration:duration
    }),
  });
  const { data, message } = await response.json();

  if (message ==="Unlocked successfully") {
    setIsLocked(false);
    setTimeRemaining(duration === Infinity ? Infinity : duration * 3600)
    startApp();
  } else {
    // setIsLocked(true);
    // setTimeRemaining(0); // Locked state, timeRemaining is 0
    handleError('Failed to unlock')
  }

}
