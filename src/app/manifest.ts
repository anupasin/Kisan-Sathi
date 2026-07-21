import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Kisan Sathi — Farmer's Companion",
    short_name: "Kisan Sathi",
    description:
      "Soil, crop, weather, loan and government guidance for Indian farmers, plus AI plant health scanning.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7f1",
    theme_color: "#2f8f4e",
    orientation: "portrait",
    lang: "en",
    categories: ["agriculture", "productivity", "utilities"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
