import { Inter, Fraunces, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

// Classic high-contrast serif to match the Prudent Valuations letterhead wordmark.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prudent-valuations.vercel.app";
const title = "Prudent Valuations | Property, Gold, Vehicle & Asset Valuation Services";
const description =
  "Professional valuation services for property, gold, vehicles, movable assets, immovable assets, and general asset reporting.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Prudent Valuations",
  keywords: [
    "valuation services",
    "property valuation",
    "gold valuation",
    "vehicle valuation",
    "asset valuation Pakistan",
    "net worth certificate",
    "Lahore valuation firm",
  ],
  openGraph: {
    type: "website",
    title,
    description,
    siteName: "Prudent Valuations",
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630, alt: "Prudent Valuations" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prudent Valuations",
    description:
      "Professional valuation services for property, gold, vehicles, and movable & immovable assets.",
    images: ["/assets/og-image.png"],
  },
  icons: {
    icon: "/assets/favicon.png",
    apple: "/assets/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#5A2A82",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Prudent Valuations",
  image: `${siteUrl}/assets/og-image.png`,
  description,
  url: siteUrl,
  email: "prudentvaluations@gmail.com",
  telephone: "+92-321-4340094",
  address: {
    "@type": "PostalAddress",
    streetAddress: "2nd Floor, Liberty, Main Boulevard, Gulberg",
    addressLocality: "Lahore",
    addressCountry: "PK",
  },
  areaServed: "PK",
  serviceType: [
    "Property Valuation",
    "Gold Valuation",
    "Vehicle Valuation",
    "Movable Asset Valuation",
    "Immovable Asset Valuation",
    "General Asset Valuation Reports",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${playfair.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
