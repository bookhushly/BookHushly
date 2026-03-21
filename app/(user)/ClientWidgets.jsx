"use client";

import dynamic from "next/dynamic";

// ssr: false is only valid inside Client Components
const ChatWidget = dynamic(() => import("@/components/support/ChatWidget"), {
  ssr: false,
});

const InstallPrompt = dynamic(
  () => import("@/components/common/InstallPrompt"),
  { ssr: false },
);

export default function ClientWidgets() {
  return (
    <>
      <ChatWidget />
      <InstallPrompt />
    </>
  );
}
