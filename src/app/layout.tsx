import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: {
    default: "HackTheAI // Cyber Investigation Labs",
    template: "%s // HackTheAI",
  },
  description:
    "Hands-on cybersecurity training rooms. Reconstruct Project Echo (VT-047) and Operation Black Relay (NF-219) task by task.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8">
          {children}
        </main>
        <footer className="relative z-10 mt-16 border-t border-void-700">
          <div className="mx-auto w-full max-w-6xl px-4 py-6">
            <p className="text-[11px] leading-relaxed text-slate-600">
              ⚠️ <span className="font-bold tracking-wider text-slate-500">TRAINING ENVIRONMENT.</span>{" "}
              All systems, domains, IP addresses, credentials, users, logs,
              applications and security events in these scenarios are fictional
              and designed exclusively for controlled cybersecurity training.
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-slate-700">
              Content by Dhruv Sharma · Trinet Layer Cyber Security Analyst Intern ·{" "}
              <Link href="/" className="hover:text-slate-500">
                Hack The AI Labs
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
