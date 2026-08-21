import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Aster — Explore the night sky", short_name: "Aster", description: "An interactive mobile guide to stars, planets, and constellations.", start_url: "/", display: "standalone", background_color: "#030712", theme_color: "#07101f", orientation: "portrait", icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }] };
}
