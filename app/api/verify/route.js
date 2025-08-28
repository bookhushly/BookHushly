import { NextResponse } from "next/server";

const QOREID_API_URL =
  process.env.QOREID_ENV === "sandbox"
    ? "https://sandbox.qoreid.com/v1"
    : "https://api.qoreid.com/v1";
const CLIENT_ID = process.env.QOREID_CLIENT_ID;
const CLIENT_SECRET = process.env.QOREID_CLIENT_SECRET;

async function getAccessToken() {
  console.log("QOREID_CLIENT_ID:", CLIENT_ID || "undefined");
  console.log("QOREID_CLIENT_SECRET:", CLIENT_SECRET ? "****" : "undefined");
  console.log("QOREID_CLIENT_SECRET type:", typeof CLIENT_SECRET);
  console.log("QOREID_API_URL:", QOREID_API_URL);

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "QOREID_CLIENT_ID or QOREID_CLIENT_SECRET is missing in environment variables"
    );
  }

  if (typeof CLIENT_ID !== "string" || typeof CLIENT_SECRET !== "string") {
    throw new Error("QOREID_CLIENT_ID or QOREID_CLIENT_SECRET is not a string");
  }

  try {
    const requestBody = {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      secret: CLIENT_SECRET, // Fallback for potential API variation
    };
    console.log("Token request body:", {
      clientId: CLIENT_ID,
      clientSecret: "****",
      secret: "****",
    });

    const response = await fetch("https://api.qoreid.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseBody = await response.text();
    console.log("QoreID token response status:", response.status);
    console.log("QoreID token response body:", responseBody);

    if (!response.ok) {
      throw new Error(
        `Failed to obtain QoreID access token: ${response.status} - ${responseBody}`
      );
    }

    const data = JSON.parse(responseBody);
    const accessToken = data.accessToken || data.access_token;
    if (!accessToken) {
      throw new Error("No access token in response");
    }

    return accessToken;
  } catch (error) {
    console.error("getAccessToken error:", error.message);
    throw error;
  }
}

export async function POST(req) {
  try {
    const { type, value, firstname, lastname } = await req.json();
    console.log("Verification request:", { type, value, firstname, lastname });

    if (!type || !value) {
      return NextResponse.json(
        { error: "Verification type and value are required" },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    let endpoint;
    let body = {};

    switch (type) {
      case "cac":
        endpoint = `${QOREID_API_URL}/ng/identities/cac-basic`;
        body = { regNumber: value };
        break;
      case "nin":
        endpoint = `${QOREID_API_URL}/ng/identities/nin/${value}`;
        body = { firstname: firstname, lastname: lastname };

        break;
      case "drivers_license":
        endpoint = `${QOREID_API_URL}/ng/identities/drivers-license/${value}`;
        body = { firstname: firstname, lastname: lastname };

        break;
      default:
        return NextResponse.json(
          { error: "Invalid verification type" },
          { status: 400 }
        );
    }

    console.log("Making QoreID request to:", endpoint, body);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("QoreID verification response:", data);

    if (!response.ok || (data && data.status !== "success")) {
      return NextResponse.json(
        {
          valid: false,
          error: data?.message || data?.error || "Verification failed",
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      data: data?.data || data,
      error: null,
    });
  } catch (error) {
    console.error("QoreID verification error:", error.message);
    return NextResponse.json(
      {
        valid: false,
        error: error.message || "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
