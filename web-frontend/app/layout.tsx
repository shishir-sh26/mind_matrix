import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mind Matrix Admin",
  description: "Admin Dashboard for Mind Matrix",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F5F7FA] text-gray-800">
        {children}
      </body>
    </html>
  );
}