import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SDKProvider from "@/provider/sdk-provider";
import SessionProvider from "@/provider/session-provider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ViewTransitions } from "next-view-transitions";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Expotes",
    template: "%s | Expotes",
  },
  description: "Best Expo OTA Alternative to EAS Updates",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <ViewTransitions>
      <html lang={locale}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <NextIntlClientProvider messages={messages}>
            <SDKProvider>
              <SessionProvider>{children}</SessionProvider>
            </SDKProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
