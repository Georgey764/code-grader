import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context";
import "xterm/css/xterm.css";

const inter = Inter({
  variable: "--font-family-sans",
  display: "swap",
  subsets: ["latin"],
});

const jetbrainsMono = localFont({
  src: "../fonts/JetBrains_Mono/JetBrainsMono-VariableFont_wght.ttf",
  variable: "--font-family-mono",
  weight: "100 900",
  fallback: ["Fira Code", "monospace"],
});

export const metadata: Metadata = {
  title: "Code Grader",
  description:
    "An AI based code grader developed by ULM students for capstone project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
