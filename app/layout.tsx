import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import "./globals.css";

/*
 * As três famílias são expostas como CSS variables porque o globals.css as
 * consome via @theme inline (--font-sans / --font-heading / --font-mono).
 * Trocar o nome da variable aqui desliga a fonte lá, silenciosamente — o
 * build não quebra, a fonte só some.
 */
const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const heading = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Calibre",
  description:
    "Clube de colecionadores de relógios onde cada peça carrega uma história.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${heading.variable} ${mono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
