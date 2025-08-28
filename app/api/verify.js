
   import { NextResponse } from "next/server";

   const QOREID_API_URL = process.env.NODE_ENV === "production" ? "https://api.qoreid.com/v1" : "https://sandbox.qoreid.com/v1";
   const CLIENT_ID = process.env.QOREID_CLIENT_ID;
   const CLIENT_SECRET = process.env.QOREID_CLIENT_SECRET;

   async function getAccessToken() {
     if (!CLIENT_ID || !CLIENT_SECRET) {
       throw new Error("QoreID client ID or secret is missing");
     }

     // Basic Auth: Encode clientId:clientSecret as base64
     const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

     const response = await fetch(`${QOREID_API_URL}/token`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "Authorization": `Basic ${authString}`,
       },
       body: JSON.stringify({
         grant_type: "client_credentials",
       }),
     });

     if (!response.ok) {
       const errorData = await response.text();
       console.error("Token request failed:", response.status, errorData);
       throw new Error(`Failed to obtain QoreID access token: ${response.status} - ${errorData}`);
     }

     const { access_token: accessToken } = await response.json();  // QoreID uses 'access_token'
     if (!accessToken) {
       throw new Error("No access token in response");
     }
     return accessToken;
   }

   export async function POST(req) {
     try {
       const { type, value, firstname, lastname } = await req.json();

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
           endpoint = `${QOREID_API_URL}/business-verification/cac`;
           body = { cacNumber: value };
           break;
         case "nin":
           endpoint = `${QOREID_API_URL}/individual/nin`;
           body = { nin: value };
           if (firstname && lastname) {
             body.firstname = firstname;
             body.lastname = lastname;
           }
           break;
         case "drivers_license":
           endpoint = `${QOREID_API_URL}/individual/drivers-license`;
           body = { driversLicense: value };
           if (firstname && lastname) {
             body.firstname = firstname;
             body.lastname = lastname;
           }
           break;
         default:
           return NextResponse.json(
             { error: "Invalid verification type" },
             { status: 400 }
           );
       }

       console.log("Making QoreID request to:", endpoint);  // Debug log

       const response = await fetch(endpoint, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${accessToken}`,
         },
         body: JSON.stringify(body),
       });

       const data = await response.json();

       console.log("QoreID response:", data);  // Debug log

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
       console.error("QoreID verification error:", error);
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
