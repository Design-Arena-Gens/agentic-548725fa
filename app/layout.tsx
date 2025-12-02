import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Receptionist Agent",
  description: "Voice-first AI receptionist for scheduling and support",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
