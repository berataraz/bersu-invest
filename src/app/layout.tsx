import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://bersuinvest.com"),
  title: { default: "Bersu Invest Yatirim", template: "%s | Bersu Invest Yatirim" },
  description: "Bersu Invest Yatirim real estate platform.",
  openGraph: { title: "Bersu Invest Yatırım", description: "Fethiye'de seçkin gayrimenkul danışmanlığı.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="tr" suppressHydrationWarning><body><ToastProvider>{children}</ToastProvider></body></html>;
}
