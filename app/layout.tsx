import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swipe Print — discover 3D prints",
  description: "Swipe through 3D printable models from across the web. Like, save, and share.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
