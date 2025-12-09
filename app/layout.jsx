import "./globals.css";

export const metadata = {
  title: "Bookhushly - African Hospitality & Service Platform",
  description:
    "Connecting Nigeria and Africa with quality hospitality, logistics, and security services.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
