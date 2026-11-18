import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/providers/AppShell";

const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sansFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dam Le Tuan Anh — Full-Stack Developer & System Thinker",
    template: "%s — Dam Le Tuan Anh",
  },
  description:
    "Full-Stack Developer & Software Engineering student at FPT University Ho Chi Minh City—moving from hackathon speed toward calm, resilient systems, grounded RAG architectures, and tactile WebGL craft.",
  icons: {
    icon: [
      { url: "/favicons/frame-0.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable}`}
    >
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
