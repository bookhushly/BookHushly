import "../globals.css";
import { Header } from "@/components/common/home/header";
import { Toaster } from "@/components/ui/sonner";
import Footer from "../../components/common/home/footer";
import ClientWidgets from "./ClientWidgets";

export default function RootLayout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen ">{children}</main>
      <Footer />
      <Toaster />
      <ClientWidgets />
    </>
  );
}
