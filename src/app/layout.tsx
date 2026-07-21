import type { Metadata, Viewport } from "next";
import {
  Inter,
  Noto_Sans_Devanagari,
  Noto_Sans_Telugu,
  Noto_Sans_Kannada,
  Noto_Sans_Tamil,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/app-shell";
import { SwRegister } from "@/components/sw-register";

const inter = Inter({
  variable: "--font-latin",
  subsets: ["latin"],
  display: "swap",
});

const notoDeva = Noto_Sans_Devanagari({
  variable: "--font-deva",
  subsets: ["devanagari"],
  display: "swap",
});

// Each Noto font only covers its own script, so all of them can sit in one
// font-family stack and the browser falls through per glyph.
const notoTelu = Noto_Sans_Telugu({
  variable: "--font-telu",
  subsets: ["telugu"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const notoKann = Noto_Sans_Kannada({
  variable: "--font-kann",
  subsets: ["kannada"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const notoTami = Noto_Sans_Tamil({
  variable: "--font-tami",
  subsets: ["tamil"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kisan Sathi — Farmer's Companion",
  description:
    "GPS-based soil, crop, weather, loan and government guidance for Indian farmers, plus AI plant health scanning. किसानों के लिए मिट्टी, फसल और सरकारी जानकारी।",
  applicationName: "Kisan Sathi",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1310" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${notoDeva.variable} ${notoTelu.variable} ${notoKann.variable} ${notoTami.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <SwRegister />
      </body>
    </html>
  );
}
