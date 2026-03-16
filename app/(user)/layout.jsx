import "../globals.css";
import { Header } from "@/components/common/home/header";

import { Toaster } from "@/components/ui/sonner";
import Footer from "../../components/common/home/footer";
import ChatWidget from "@/components/support/ChatWidget";

export const metadata = {
  title: "Bookhushly - African Hospitality & Service Platform",
  description:
    "Connecting Nigeria and Africa with quality hospitality, logistics, and security services.",
};

export default function RootLayout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen ">{children}</main>
      <Footer />
      <Toaster />
      <ChatWidget />
    </>
  );
}
