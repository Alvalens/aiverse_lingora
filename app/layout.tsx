import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextAuthProvider } from "@/providers/NextAuthProviders";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import Script from "next/script";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Intervyou | Platform Wawancara & Analisis CV",
    template: "%s | Intervyou",
    absolute: "Intervyou | Platform Wawancara & Analisis CV",
  },
  applicationName: "Intervyou",
  description:
    "Platform pelatihan wawancara kerja dan optimasi CV. Dapatkan saran, evaluasi, dan pelatihan untuk mengembangkan karir.",
  keywords: [
    "wawancara kerja",
    "analisis CV",
    "pengembangan karir",
    "resume",
    "lowongan kerja",
    "platform wawancara",
    "latihan wawancara",
    "AI interview",
    "AI resume",
    "AI career development",
    "AI CV analysis",
  ],
  authors: [
    {
      name: "AI Verse",
      url: "https://www.intervyou.me",
    },
  ],
  openGraph: {
    title: "Intervyou | Platform Pelatihan Wawancara AI",
    description:
      "Platform inovatif untuk membantu profesional mempersiapkan wawancara kerja dan meningkatkan CV mereka.",
    url: "https://www.intervyou.me",
    siteName: "Intervyou",
    // images: [
    //   {
    //     url: ogImage.src,
    //     width: 1200,
    //     height: 630,
    //     alt: "Intervyou",
    //   },
    // ],
    locale: "id_ID",
    type: "website",
  },
  // twitter: {
  //   card: "summary_large_image",
  //   site: "@situsanda",
  //   creator: "@situsanda",
  //   title: "Intervyou | Platform Wawancara & Analisis CV",
  //   description:
  //     "Platform inovatif yang membantu profesional mempersiapkan wawancara kerja dan meningkatkan CV mereka.",
  //   images: ["https://www.intervyou.me/twitter-image.jpg"],
  // },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.intervyou.me",
  },
};

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <main>
          <ReactQueryProvider>
          {children}
          </ReactQueryProvider>
        </main>
      </body>
    </html>
  );
}
