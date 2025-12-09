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
      secret: CLIENT_SECRET,
    };
    console.log("Token request body:", {
      clientId: CLIENT_ID,
      clientSecret: "****",
      secret: "****",
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch("https://api.qoreid.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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
    console.log("Verification request:", {
      type,
      value: type === "nin" ? "****" : value,
      firstname: firstname ? "****" : undefined,
      lastname: lastname ? "****" : undefined,
    });

    // Validate required fields
    if (!type || !value) {
      return NextResponse.json(
        {
          valid: false,
          error: "Verification type and value are required",
          data: null,
        },
        { status: 400 }
      );
    }

    // Validate NIN-specific inputs
    if (type === "nin") {
      if (!firstname || !lastname) {
        return NextResponse.json(
          {
            valid: false,
            error: "Firstname and lastname are required for NIN verification",
            data: null,
          },
          { status: 400 }
        );
      }
      if (!/^\d{11}$/.test(value)) {
        return NextResponse.json(
          { valid: false, error: "NIN must be an 11-digit number", data: null },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z\s]+$/.test(firstname) || !/^[a-zA-Z\s]+$/.test(lastname)) {
        return NextResponse.json(
          {
            valid: false,
            error: "Names must contain only letters and spaces",
            data: null,
          },
          { status: 400 }
        );
      }
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
        body = {
          firstname: firstname.toUpperCase(),
          lastname: lastname.toUpperCase(),
        };
        break;
      case "drivers_license":
        endpoint = `${QOREID_API_URL}/ng/identities/drivers-license/${value}`;
        body = {
          firstname: firstname.toUpperCase(),
          lastname: lastname.toUpperCase(),
        };
        break;
      default:
        return NextResponse.json(
          { valid: false, error: "Invalid verification type", data: null },
          { status: 400 }
        );
    }

    console.log("Making QoreID request to:", endpoint, {
      ...body,
      firstname: body.firstname ? "****" : undefined,
      lastname: body.lastname ? "****" : undefined,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // ✅ Increased to 15s
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const qoreidData = await response.json();
    console.log(
      "QoreID full verification response:",
      JSON.stringify(qoreidData, null, 2)
    );

    // ✅ Validate response structure
    if (!qoreidData?.status || !qoreidData?.status?.status) {
      console.error("❌ Invalid response structure:", qoreidData);
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid response format from verification service",
          data: null,
        },
        { status: 500 }
      );
    }

    // ✅ Check for verification failure
    if (!response.ok || qoreidData.status.status !== "verified") {
      console.error("❌ Verification failed:", {
        status: qoreidData.status,
        message: qoreidData.status.message || qoreidData.error,
      });
      return NextResponse.json(
        {
          valid: false,
          error:
            qoreidData.status.message ||
            qoreidData.error ||
            "Verification failed: Invalid data or mismatch",
          data: null,
        },
        { status: response.ok ? 400 : response.status }
      );
    }

    // ✅ Success case - Extract the correct data based on type
    let extractedData;
    switch (type) {
      case "nin":
        extractedData = qoreidData.nin || qoreidData.summary || qoreidData;
        break;
      case "cac":
        extractedData = qoreidData.cac || qoreidData.summary || qoreidData;
        break;
      case "drivers_license":
        extractedData =
          qoreidData.driversLicense || qoreidData.summary || qoreidData;
        break;
      default:
        extractedData = qoreidData;
    }

    console.log("✅ Verification successful, extracted data:", {
      type,
      hasData: !!extractedData,
      dataKeys: extractedData ? Object.keys(extractedData) : [],
    });

    return NextResponse.json({
      valid: true,
      data: extractedData,
      error: null,
    });
  } catch (error) {
    console.error("❌ QoreID verification error:", error.message);
    console.error("Error stack:", error.stack);
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
