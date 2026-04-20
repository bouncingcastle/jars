import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kids Jars",
    short_name: "Jars",
    description: "A private family app for splitting pocket money into jars.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f3e8",
    theme_color: "#ec6b3b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
