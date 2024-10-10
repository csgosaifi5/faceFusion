import { getUserById, updateUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const { app_id, user_id } = await request.json();

    const user = await getUserById(user_id);
    if (!user) {
      return new NextResponse(JSON.stringify({ data: { is_locked: true }, message: "User not found" }), {
        status: 200,
      });
    }

    const now = new Date().getTime();
    if (user.expiry_time && new Date(user.expiry_time).getTime() < now) {
      // Update the lock status to true if the expiry time has passed
      const updatedUser = await updateUser(user_id, { is_locked: true });

      if (!updatedUser) {
        return new Response(JSON.stringify({ error: "Failed to update lock status" }), {
          status: 500,
        });
      }

      // Return the updated lock status
      return new NextResponse(JSON.stringify({ data: { is_locked: true }, message: "Lock status updated" }), {
        status: 200,
      });
    }

    // If the unlock hasn't expired yet, return the current data
    return new NextResponse(JSON.stringify({ data: user, message: "Unlock hasn't expired yet" }), { status: 200 });
  } catch (error) {
    console.error("Error in POST:", error);
    // Return an error response in case of failure
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

export const PUT = async (request: Request) => {
  try {
    const { duration, user_id } = await request.json();

    const unlockTime = new Date().getTime();
    const expiryTime = duration === Infinity ? undefined : new Date(unlockTime + duration * 10 * 1000);
    const updatedUser = await updateUser(user_id, {
      is_locked: false,
      unlock_time: new Date(unlockTime),
      expiry_time: expiryTime,
    });
      
      
    if (!updatedUser) {
      return new NextResponse(JSON.stringify({ error: "Failed to unlock" }), {
        status: 500,
      });
    }

    return new NextResponse(JSON.stringify({ data: updatedUser, message: "Unlocked successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error in POST:", error);
    // Return an error response in case of failure
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

export const PATCH = async (request: Request) => {
  try {
    const { employerId, start, perPage, filter } = await request.json();
    let result: any = null;

    return new NextResponse(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Error in POST:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
