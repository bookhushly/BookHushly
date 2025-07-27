export async function GET() {
  console.log("✅ API route hit: /api/test-middleware");
  return new Response(
    JSON.stringify({ message: "Middleware did NOT run here." }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
