import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/userContext";

export const metadata: Metadata = {
  title: "Storyflick — Short Stories Worth Staying Up For",
  description: "Cinematic short fiction. One story, 6 scenes, 4 minutes.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Storyflick",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-body bg-ink-950 text-ink-100 antialiased">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
