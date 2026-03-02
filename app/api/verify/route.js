import { NextResponse } from "next/server";

const QOREID_API_URL =
  process.env.QOREID_ENV === "sandbox"
    ? "https://sandbox.qoreid.com/v1"
    : "https://api.qoreid.com/v1";
const CLIENT_ID = process.env.QOREID_CLIENT_ID;
const CLIENT_SECRET = process.env.QOREID_CLIENT_SECRET;

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("QOREID_CLIENT_ID or QOREID_CLIENT_SECRET is missing");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch("https://api.qoreid.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      secret: CLIENT_SECRET,
    }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  const responseBody = await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to obtain QoreID token: ${response.status} - ${responseBody}`,
    );
  }

  const data = JSON.parse(responseBody);
  const accessToken = data.accessToken || data.access_token;
  if (!accessToken) throw new Error("No access token in response");

  return accessToken;
}

function isVerified(qoreidData) {
  // QoreID can return status in multiple shapes — handle all of them
  const statusField =
    qoreidData?.status?.status || // { status: { status: "verified" } }
    qoreidData?.status?.state || // { status: { state: "verified" } }
    qoreidData?.summary?.status || // { summary: { status: "verified" } }
    qoreidData?.verificationStatus || // { verificationStatus: "verified" }
    qoreidData?.status; // { status: "verified" } (string)

  if (typeof statusField === "string") {
    return statusField.toLowerCase() === "verified";
  }

  return false;
}

function getErrorMessage(qoreidData) {
  return (
    qoreidData?.status?.message ||
    qoreidData?.summary?.message ||
    qoreidData?.message ||
    qoreidData?.error ||
    "Verification failed. Please check your details and try again."
  );
}

export async function POST(req) {
  try {
    const { type, value, firstname, lastname } = await req.json();

    if (!type || !value) {
      return NextResponse.json(
        {
          valid: false,
          error: "Verification type and value are required",
          data: null,
        },
        { status: 400 },
      );
    }

    if (type === "nin") {
      if (!firstname || !lastname) {
        return NextResponse.json(
          {
            valid: false,
            error: "First name and last name are required for NIN verification",
            data: null,
          },
          { status: 400 },
        );
      }
      if (!/^\d{11}$/.test(value)) {
        return NextResponse.json(
          { valid: false, error: "NIN must be an 11-digit number", data: null },
          { status: 400 },
        );
      }
      if (!/^[a-zA-Z\s]+$/.test(firstname) || !/^[a-zA-Z\s]+$/.test(lastname)) {
        return NextResponse.json(
          {
            valid: false,
            error: "Names must contain only letters and spaces",
            data: null,
          },
          { status: 400 },
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
          firstname: firstname.trim().toUpperCase(),
          lastname: lastname.trim().toUpperCase(),
        };
        break;
      case "drivers_license":
        endpoint = `${QOREID_API_URL}/ng/identities/drivers-license/${value}`;
        body = {
          firstname: firstname.trim().toUpperCase(),
          lastname: lastname.trim().toUpperCase(),
        };
        break;
      default:
        return NextResponse.json(
          { valid: false, error: "Invalid verification type", data: null },
          { status: 400 },
        );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
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

    // Always log the full response in dev — critical for debugging QoreID shape changes
    console.log("QoreID raw response:", JSON.stringify(qoreidData, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        {
          valid: false,
          error: getErrorMessage(qoreidData),
          data: null,
        },
        { status: response.status },
      );
    }

    if (!isVerified(qoreidData)) {
      console.error(
        "Verification not confirmed. Response shape:",
        Object.keys(qoreidData),
      );
      return NextResponse.json(
        {
          valid: false,
          error: getErrorMessage(qoreidData),
          data: null,
        },
        { status: 400 },
      );
    }

    // Extract relevant data based on type
    const extractedData =
      qoreidData?.[
        type === "nin" ? "nin" : type === "cac" ? "cac" : "driversLicense"
      ] ||
      qoreidData?.summary ||
      qoreidData;

    return NextResponse.json({ valid: true, data: extractedData, error: null });
  } catch (error) {
    console.error("QoreID verification error:", error.message);

    if (error.name === "AbortError") {
      return NextResponse.json(
        {
          valid: false,
          error: "Verification service timed out. Please try again.",
          data: null,
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        valid: false,
        error: error.message || "Internal server error",
        data: null,
      },
      { status: 500 },
    );
  }
}
