import { getUserById, updateUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";
const API_BASE_URL = "https://instance-manager.onrender.com"; // Replace with your actual API base URL
const AUTH_USERNAME = "admin"; // Replace with your username
const AUTH_PASSWORD = "secret"; // Replace with your password
import { encodeCredentials, wait } from "@/lib/helpers/facefusion";

export const PUT = async (request: Request) => {
  try {
    const { user_id, contract_id } = await request.json();

    const user = await getUserById(user_id);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ data: { facefusion: { is_locked: true } }, message: "User not found" }),
        {
          status: 200,
        }
      );
    }
    const updatedUser = await updateUser(user_id, {
      facefusion: {
        ...user.facefusion,
        contract_id: `${contract_id}`,
      },
    });
    if (!updatedUser) {
      return new Response(JSON.stringify({ error: "Failed to update Contract_id" }), {
        status: 500,
      });
    }

    // If the unlock hasn't expired yet, return the current data
    return new NextResponse(JSON.stringify({ data: user, message: "Contract_id added successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error in POST:", error);
    // Return an error response in case of failure
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
export const POST = async (request: Request) => {
  try {
    const { user_id } = await request.json();

    const user = await getUserById(user_id);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ data: { facefusion: { is_locked: true } }, message: "User not found" }),
        {
          status: 200,
        }
      );
    }

    const destroyVastInstanceResponse = await fetch(`${API_BASE_URL}/vast/destroy/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: encodeCredentials(AUTH_USERNAME, AUTH_PASSWORD),
      },
      body: JSON.stringify({ contract_id: user.facefusion.contract_id }),
    });
    const destroyVastInstanceData = await destroyVastInstanceResponse.json();
    
// "status": "instance destroyed"
    console.log(destroyVastInstanceData);

    // If the unlock hasn't expired yet, return the current data
    return new NextResponse(JSON.stringify({ data: user, message: "Vast Instance destroyed" }), { status: 200 });
  } catch (error) {
    console.error("Error in POST:", error);
    // Return an error response in case of failure
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
