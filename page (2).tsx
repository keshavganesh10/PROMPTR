import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Promptr — Better Questions Get Better Answers",
  description:
    "Transform your unrefined ideas into perfectly engineered AI prompts. Tailored for Claude, GPT-4o, Gemini, and Lovable. Features Lenz — the teaching engine that guides, never solves.",
  keywords: [
    "prompt engineering",
    "AI prompts",
    "Claude",
    "GPT-4o",
    "Gemini",
    "prompt optimiser",
    "tutoring",
  ],
  openGraph: {
    title: "Promptr — Better Questions Get Better Answers",
    description:
      "The prompt-engineering tool that maximises your GenAI output. Model-specific syntax, community cheat codes, and Lenz tutoring mode.",
    type: "website",
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-[#F5EDE0] text-[#2C1810] font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </body>
    </html>
  );
}
