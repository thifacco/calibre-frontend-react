import Link from "next/link";
import { MainNavSheet } from "./MainNavSheet";

/**
 * Header fixo das três páginas: logo à esquerda, hambúrguer à direita.
 *
 * Server Component de propósito — só o `MainNavSheet` precisa de estado de
 * sessão, e é ele que carrega o `"use client"`. Manter a barra no servidor
 * deixa fora do bundle do browser tudo que não é o menu.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-3.5">
        <Link
          href="/"
          className="font-heading text-lg font-medium tracking-wide text-foreground rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Calibre
        </Link>
        <MainNavSheet />
      </div>
    </header>
  );
}
