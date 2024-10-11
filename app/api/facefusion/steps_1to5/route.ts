import { getUserById, updateUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";
import { encodeCredentials, wait } from "@/lib/helpers/facefusion";
const API_BASE_URL = "https://instance-manager.onrender.com"; // Replace with your actual API base URL
const AUTH_USERNAME = "admin"; // Replace with your username
const AUTH_PASSWORD = "secret"; // Replace with your password

const CheckLoack = async (user_id: string) => {
  const user = await getUserById(user_id);
  if (!user) {
    return { is_locked: true, message: "User not found" };
  }

  if (user.is_locked) {
    // Return the updated lock status
    return { is_locked: user.is_locked, message: "App is locked" };
  }

  // If the unlock hasn't expired yet, return the current data
  return { data: user, message: "Unlock hasn't expired yet" };
};

export const POST = async (request: Request) => {
  try {
    const { app_id, user_id } = await request.json();
    const { is_locked, message } = await CheckLoack(user_id);

    if (is_locked) {
      return new NextResponse(JSON.stringify({ error: message }), {
        status: 500,
      });
    }

    let contract_created = false;
    let index = 0;
    let tries = 0;
    let contractId: string | null = null;

    while (!contract_created) {
      await wait(1000);
      tries = tries + 1;
      if (tries > 3) {
        tries = 0;
      }
      const startVastResponse = await fetch(`${API_BASE_URL}/vast/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: encodeCredentials(AUTH_USERNAME, AUTH_PASSWORD),
        },
        body: JSON.stringify({
          template_id: "roop_unleashed", // Replace with actual template ID
          index: index, // Start with index 0; increment if needed
        }),
      });

      if (startVastResponse.ok) {
        contract_created = true;
        if (tries === 2) {
          index = index + 1;
        }
        if (index > 3) {
          throw new Error(`Failed to create instance`);
        }
      }
      const startVastData = await startVastResponse.json();
      contractId = startVastData.contract_id;
    }
    // Adjust according to actual response
    if (contractId === null) {
      return new NextResponse(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
    }


    return new NextResponse(JSON.stringify({ contractId: contractId }), { status: 200 });
  } catch (error) {
    console.error("Error in POST:", error);
    // Return an error response in case of failure
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

// export const PUT = async (request: Request) => {
//   try {
//     const { duration, user_id } = await request.json();

//     const unlockTime = new Date().getTime();
//     const expiryTime = duration === Infinity ? undefined : new Date(unlockTime + duration * 60 * 1000);
//     const updatedUser = await updateUser(user_id, {
//       is_locked: false,
//       unlock_time: new Date(unlockTime),
//       expiry_time: expiryTime,
//     });

//     if (!updatedUser) {
//       return new NextResponse(JSON.stringify({ error: "Failed to unlock" }), {
//         status: 500,
//       });
//     }

//     return new NextResponse(JSON.stringify({ data: updatedUser, message: "Unlocked successfully" }), { status: 200 });
//   } catch (error) {
//     console.error("Error in POST:", error);
//     // Return an error response in case of failure
//     return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
//   }
// };

// export const PATCH = async (request: Request) => {
//   try {
//     const { duration, user_id } = await request.json();

//     const user = await getUserById(user_id);
//     if (!user) {
//       return new NextResponse(JSON.stringify({ data: { is_locked: true }, message: "User not found" }), {
//         status: 200,
//       });
//     }

//     const unlockDate = new Date(user.unlock_time);
//     const currentTime = new Date();

//     // Calculate the time difference since unlock_time
//     const timePassed = currentTime.getTime() - unlockDate.getTime();
//     const expiryTime =
//       duration === Infinity
//         ? undefined
//         : new Date(new Date(user.expiry_time).getTime() + duration * 60 * 1000 - timePassed);

//     const updatedUser = await updateUser(user_id, {
//       is_locked: false,
//       expiry_time: expiryTime,
//       unlock_time: currentTime,
//     });

//     if (!updatedUser) {
//       return new NextResponse(JSON.stringify({ error: "Failed to unlock" }), {
//         status: 500,
//       });
//     }

//     return new NextResponse(JSON.stringify({ data: updatedUser, message: "Time added successfully" }), { status: 200 });
//   } catch (error) {
//     console.error("Error in POST:", error);
//     // Return an error response in case of failure
//     return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
//   }
// };
