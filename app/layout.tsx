import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import { ApiProvider } from "@/domain/shared/context/ApiContext";
import { AppHeader } from "@/domain/shared/components/AppHeader";
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
      <body className="min-h-full flex flex-col">
        <ApiProvider>
          {/*
            Atalho para pular o header. O brief exige o fluxo de cadastro
            operável só por teclado, e sem isto cada Tab começa pelo menu.
          */}
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Pular para o conteúdo
          </a>
          <AppHeader />
          <main id="conteudo" className="flex-1">
            {children}
          </main>
        </ApiProvider>
      </body>
    </html>
  );
}
