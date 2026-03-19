import "../globals.css";
import { Header } from "@/components/common/home/header";

import { Toaster } from "@/components/ui/sonner";
import Footer from "../../components/common/home/footer";
import ChatWidget from "@/components/support/ChatWidget";
import InstallPrompt from "@/components/common/InstallPrompt";

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
