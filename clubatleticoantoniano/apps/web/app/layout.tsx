import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://caantoniano.es"),
  title: {
    default: "Club Atlético Antoniano",
    template: "%s · Club Atlético Antoniano",
  },
  description:
    "Web oficial del Club Atlético Antoniano: primer equipo, cantera, noticias y entradas.",
  applicationName: "Club Atlético Antoniano",
  keywords: [
    "Club Atlético Antoniano",
    "fútbol",
    "cantera",
    "Lebrija",
    "primer equipo",
    "entradas",
  ],
  authors: [{ name: "Club Atlético Antoniano" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Club Atlético Antoniano",
    title: "Club Atlético Antoniano",
    description:
      "Web oficial del Club Atlético Antoniano. Vive el club desde dentro.",
    // Imagen al compartir el enlace (WhatsApp, redes…).
    images: [{ url: "/images/partido-01.jpg", width: 1200, height: 800 }],
  },
  // El favicon lo sirven app/icon.png y app/apple-icon.png (convención Next).
};

export const viewport: Viewport = {
  themeColor: "#c8102e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${barlow.variable}`}>
      <body className="min-h-screen bg-surface text-text antialiased">
        {children}
      </body>
    </html>
  );
}
