import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";

/** Same three families the legacy index.html loaded from Google Fonts. */
export const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  variable: "--font-fraunces",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const fontClassNames = `${inter.variable} ${fraunces.variable} ${plexMono.variable}`;
