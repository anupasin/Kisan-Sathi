"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/i18n/language-provider";
import { LocationProvider } from "@/lib/location-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        <LocationProvider>{children}</LocationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
