import "../globals.css";
import dynamic from "next/dynamic";
import { Header } from "@/components/common/home/header";
import { Toaster } from "@/components/ui/sonner";
import Footer from "../../components/common/home/footer";

// Lazy-load non-critical widgets — keeps framer-motion out of the initial bundle
// and defers their JS until after the page is interactive (improves FCP + LCP).
const ChatWidget = dynamic(() => import("@/components/support/ChatWidget"), {
  ssr: false,
});

const InstallPrompt = dynamic(
  () => import("@/components/common/InstallPrompt"),
  { ssr: false },
);

export default function RootLayout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen ">{children}</main>
      <Footer />
      <Toaster />
      <ChatWidget />
      <InstallPrompt />
    </>
  );
}
