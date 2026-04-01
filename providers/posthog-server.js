import { PostHog } from "posthog-node";

export async function POST() {
  const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });

  posthog.capture({
    distinctId: "distinct_id_of_the_user",
    event: "event_name",
  });

  await posthog.shutdown();
}
