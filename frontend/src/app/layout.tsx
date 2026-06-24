import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Orbit — AI Marketing Platform",
  description: "Write content, schedule posts, generate videos, and discover what drives results — all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "#1f2937", color: "#fff", border: "1px solid #374151" },
          }}
        />
      </body>
    </html>
  );
}
