import { sendPushToUser } from "@/lib/push-service";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json(
      { error: "userId query param required" },
      { status: 400 },
    );
  }

  await sendPushToUser(userId, {
    title: "Test Notification",
    body: "Push notifications are working on Bookhushly!",
    url: "/dashboard/customer",
  });

  return Response.json({ sent: true });
}
