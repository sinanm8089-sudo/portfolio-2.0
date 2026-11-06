import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sinan Mohammed | Cybersecurity × AI × Full-Stack Portfolio",
  description:
    "Portfolio 2.0 of Sinan Mohammed — B.Tech Cyber Security student & developer specializing in ethical hacking, penetration testing, AI security, and full-stack development.",
  keywords: [
    "Sinan Mohammed",
    "Cybersecurity",
    "Penetration Testing",
    "Ethical Hacking",
    "AI Security",
    "Full-Stack Developer",
    "Kerala",
    "KTU",
  ],
  authors: [{ name: "Sinan Mohammed" }],
  openGraph: {
    type: "website",
    title: "Sinan Mohammed | Cybersecurity Command Center",
    description:
      "Explore cybersecurity engineering tools, full-stack projects, verified credentials, and research by Sinan Mohammed.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${firaCode.variable} dark`}
    >
      <body className="min-h-screen bg-cyber-black font-sans text-cyber-text antialiased">
        {children}
      </body>
    </html>
  );
}

