import "../globals.css";
import { Header } from "@/components/layout/header";
import {
  Footer,
  FooterBentoGrid,
  FooterCardStack,
  FooterSidebar,
  FooterSplitScreen,
} from "@/components/layout/footer";
import { SessionProvider } from "@/components/auth/session-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Bookhushly - African Hospitality & Service Platform",
  description:
    "Connecting Nigeria and Africa with quality hospitality, logistics, and security services.",
};

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      <Header />
      <main className="min-h-screen ">{children}</main>
      <FooterSidebar />
      <Toaster />
    </SessionProvider>
  );
}
