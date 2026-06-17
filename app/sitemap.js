const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prudent-valuations.vercel.app";

export default function sitemap() {
  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
