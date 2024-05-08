// This is the root layout component for your Next.js app.
// Learn more: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required

import type { ReactNode } from "react";
import { Chivo } from "next/font/google";
import { Libre_Franklin } from "next/font/google";

const chivo = Chivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-chivo",
});
const libre_franklin = Libre_Franklin({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-libre_franklin",
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={chivo.variable + " " + libre_franklin.variable}>
      {children}
    </div>
  );
}
