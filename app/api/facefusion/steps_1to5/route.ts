import { getUserById, updateUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";
import { encodeCredentials, wait } from "@/lib/helpers/facefusion";
const API_BASE_URL = "https://instance-manager.onrender.com"; // Replace with your actual API base URL
const AUTH_USERNAME = "admin"; // Replace with your username
const AUTH_PASSWORD = "secret"; // Replace with your password
const username = "root";
const sshkeypath = "vastai";

const CheckLock = async (user_id: string) => {
  const user = await getUserById(user_id);
  if (!user) {
    return { is_locked: true, message: "User not found" };
  }

  if (user.facefusion.is_locked) {
    // Return the updated lock status
    return { is_locked: user.facefusion.is_locked, message: "App is locked" };
  }

  // If the unlock hasn't expired yet, return the current data
  return { user: user, message: "Unlock hasn't expired yet" };
};

//STEP 1

export const POST = async (request: Request) => {
  try {
    const { user_id } = await request.json();
    const { is_locked, user, message } = await CheckLock(user_id);

    if (is_locked) {
      return new NextResponse(JSON.stringify({ error: message }), {
        status: 500,
      });
    }

    let contractId: string | null = null;
    let tries = 0;
    let index = 1;
    let contract_created = false;
    let maxTotalTries = 10; // Set a limit for total attempts to prevent an infinite loop

    while (!contract_created && maxTotalTries > 0) {
      await wait(5000);
      tries++;
      maxTotalTries--; // Decrease max total tries

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
          index: index.toString(), // Start with index 0; increment if needed
        }),
      });

      if (startVastResponse.ok) {
        contract_created = true;
        if (tries === 2) {
          index++;
        }
        if (index > 3) {
          throw new Error(`Failed to create instance`);
        }
      } else {
        console.log("API call failed, retrying...");
      }

      const startVastData = await startVastResponse.json();
      contractId = startVastData.contract;
    }

    if (!contract_created) {
      throw new Error("Failed to create contract after multiple attempts.");
    }

    // Adjust according to actual response
    if (contractId === null) {
      return new NextResponse(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
    }
    const updatedUser = await updateUser(user_id, {
      facefusion: {
        ...user.facefusion,
        contractId: contractId,
      },
    });
    if (!updatedUser) {
      return new NextResponse(JSON.stringify({ error: "Something Went Wrong With User Update" }), {
        status: 500,
      });
    }

    return new NextResponse(JSON.stringify({ contractId: contractId }), { status: 200 });
  } catch (error) {
    console.error("Error in POST:", error);
    // Return an error response in case of failure
    return new NextResponse(JSON.stringify({ error: error }), { status: 500 });
  }
};

//STEP 2
export const PUT = async (request: Request) => {
  try {
    const { user_id, contract_id } = await request.json();

    const { is_locked, user, message } = await CheckLock(user_id);
    if (is_locked) {
      return new NextResponse(JSON.stringify({ error: "App is Locked" }), { status: 500 });
    }

    const checkStartedResponse = await fetch(`${API_BASE_URL}/vast/${contract_id.toString()}/check_if_started`, {
      method: "GET",
      headers: {
        Authorization: encodeCredentials(AUTH_USERNAME, AUTH_PASSWORD),
      },
    });

    if (!checkStartedResponse.ok) {
      return new NextResponse(JSON.stringify({ error: `Failed to check if started.` }), {
        status: 500,
      });
    }

    const checkStartedData = await checkStartedResponse.json();
    // console.log(checkStartedData);

    if (!checkStartedData.started) {
      return new NextResponse(JSON.stringify({ error: `App has not started Yet.` }), {
        status: 500,
      });
    }

    return new NextResponse(JSON.stringify({ data: checkStartedData, message: "App started" }), { status: 200 });
  } catch (error) {
    console.error("Error in POST:", error);
    // Return an error response in case of failure
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

//STEP 3 to 5
export const PATCH = async (request: Request) => {
  const { user_id, contract_id } = await request.json();
  //get ssh details and make mgr and session
  try {
    const sshDetailsResponse = await fetch(`${API_BASE_URL}/vast/${contract_id.toString()}/ssh-details`, {
      method: "GET",
      headers: {
        Authorization: encodeCredentials(AUTH_USERNAME, AUTH_PASSWORD),
      },
    });

    if (!sshDetailsResponse.ok) {
      throw new Error(`Failed to get SSH details: ${sshDetailsResponse.statusText}`);
    }

    const sshDetailsData = await sshDetailsResponse.json();
    //We are not gettigg all 4 values only port and public_id in ssh-details api
    const { public_id, port, username, ssh_key_path } = sshDetailsData; // Adjust according to actual response

    //We are here and need to adjust body to create manager

    // 4. Create a manager
    const createManagerResponse = await fetch(`${API_BASE_URL}/managers/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: encodeCredentials(AUTH_USERNAME, AUTH_PASSWORD),
      },
      body: JSON.stringify({
        host: public_id,
        port: port,
        username: username,
        ssh_key_path: sshkeypath, // Provide the path to your SSH key
      }),
    });

    if (!createManagerResponse.ok) {
      throw new Error(`Failed to create manager: ${createManagerResponse.statusText}`);
    }

    const createManagerData = await createManagerResponse.json();
    const managerId = createManagerData.manager_id; // Adjust according to actual response

    // 5. Create a session
    const sessionId = "facefusion" + user_id;

    const createSessionResponse = await fetch(
      `${API_BASE_URL}/managers/${managerId}/sessions/?session_id=${sessionId}`,
      {
        method: "POST",
        headers: {
          Authorization: encodeCredentials(AUTH_USERNAME, AUTH_PASSWORD),
        },
      }
    );

    if (!createSessionResponse.ok) {
      throw new Error(`Failed to create session: ${createSessionResponse.statusText}`);
    }

    const createSessionData = await createSessionResponse.json();
    return new NextResponse(
      JSON.stringify({ data: createSessionData, message: "App started", managerId: managerId, sessionId: sessionId }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
};
