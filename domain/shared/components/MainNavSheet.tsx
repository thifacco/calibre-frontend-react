"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { LogOutIcon, MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useApi } from "../context/ApiContext";

/**
 * Menu hambúrguer do header. Aparece em toda largura de tela, inclusive
 * desktop — é decisão de identidade do produto, não de responsividade.
 *
 * O `Sheet` do shadcn é um Dialog do Radix por baixo: foco preso enquanto
 * aberto, Esc fecha, `aria-modal` e rótulo vindo do `SheetTitle`. É o que faz
 * o menu ser operável por teclado e por DOM sem código de acessibilidade nosso.
 *
 * O estado de abertura é controlado aqui, em vez de envolver cada link num
 * `SheetClose asChild`: o `SheetClose` injeta `type="button"` no filho, e num
 * `<a>` isso é atributo sem sentido. O DOM é o contrato com o agente, então
 * fechar no clique custa um `useState` e sai limpo.
 */

const LINK_CLASS =
  "flex items-center rounded-md px-3 py-2.5 text-[0.9375rem] text-foreground transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none";

export function MainNavSheet() {
  const { status, session, signOut } = useApi();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const handleSignOut = useCallback(() => {
    signOut();
    setOpen(false);
  }, [signOut]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="Abrir menu"
          data-testid="botao-menu"
        >
          <MenuIcon aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" showCloseButton={false} className="gap-0">
        <SheetHeader className="flex-row items-center justify-between border-b border-border">
          {/* O SheetTitle é o que nomeia o diálogo para leitor de tela e agente. */}
          <SheetTitle className="font-heading text-base font-medium">Navegação</SheetTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Fechar menu"
            onClick={close}
          >
            <XIcon aria-hidden="true" />
          </Button>
        </SheetHeader>

        {status === "authenticated" && session !== null && (
          <p className="px-4 pt-4 text-xs text-muted-foreground">
            Conectado como <span className="text-foreground">{session.userName}</span>
          </p>
        )}

        <nav aria-label="Navegação principal" className="flex flex-col gap-1 p-4">
          <Link href="/" className={LINK_CLASS} onClick={close}>
            Feed
          </Link>

          {/*
            Enquanto o status é "loading" o localStorage ainda não foi lido.
            Mostrar "Entrar" aqui faria o link piscar para "Minha coleção" logo
            depois, em toda recarga de quem está logado.
          */}
          {status === "loading" && <Skeleton className="mx-3 my-2.5 h-5 w-32" />}

          {status === "anonymous" && (
            <Link href="/cadastro" className={LINK_CLASS} onClick={close}>
              Entrar ou cadastrar
            </Link>
          )}

          {status === "authenticated" && (
            <>
              <Link href="/dashboard" className={LINK_CLASS} onClick={close}>
                Minha coleção
              </Link>
              <Button
                type="button"
                variant="ghost"
                onClick={handleSignOut}
                className="mt-2 h-auto justify-start px-3 py-2.5 text-[0.9375rem] font-normal text-muted-foreground"
                data-testid="botao-sair"
              >
                <LogOutIcon aria-hidden="true" />
                Sair
              </Button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
