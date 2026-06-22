export default function manifest() {
  return {
    name: "Prudent Valuations",
    short_name: "Prudent Valuations",
    description:
      "Professional valuation services for property, gold, vehicles, and movable assets.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#5A2A82",
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
