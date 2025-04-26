
import { Geist, Geist_Mono,Quicksand } from "next/font/google";
import { NextAuthProvider } from "@/providers/NextAuthProviders";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import Script from "next/script";
import "./globals.css";

// import ogImage from "@/public/og-image.jpg";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quickSand = Quicksand({
  variable: "--font-quick-sand",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      ></Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${quickSand.variable}  antialiased bg-primary`}
      >
        <main>
          <Toaster />
          <ReactQueryProvider>

            <NextAuthProvider>{children}</NextAuthProvider>
          </ReactQueryProvider>
        </main>
      </body>
    </html>
  );
}
