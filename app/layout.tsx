import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Using system fonts for Helvetica Neue and Gotham-like appearance
// These will be defined in CSS with fallbacks

export const metadata: Metadata = {
  title: "BARBERSHOP EST. 2018 | Kać",
  description: "Profesionalan pristup, savremeni trendovi i osećaj premium nege. Zakažite svoj termin online.",
  keywords: ["barbershop", "frizer", "šišanje", "brada", "Kać", "Novi Sad"],
  openGraph: {
    title: "BARBERSHOP EST. 2018",
    description: "Profesionalan pristup, savremeni trendovi i osećaj premium nege.",
    type: "website",
    locale: "sr_RS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={montserrat.variable}>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
