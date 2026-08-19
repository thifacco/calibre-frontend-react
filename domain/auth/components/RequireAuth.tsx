"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "../hooks/useSession";

/**
 * Porteiro das rotas autenticadas.
 *
 * A decisão só acontece quando `status` sai de `loading`. Enquanto o
 * localStorage não foi lido não dá para saber se há sessão, e tratar esse
 * intervalo como "anônimo" expulsaria de /dashboard quem está logado, a cada
 * recarga da página.
 *
 * Isto é proteção de UI, não de segurança: quem garante o acesso é o Bearer
 * token exigido pelo back-end. Aqui só se evita mostrar tela vazia a quem não
 * tem sessão.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/cadastro");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div
        className="mx-auto w-full max-w-2xl px-5 py-10"
        aria-busy="true"
        aria-live="polite"
        data-testid="carregando-sessao"
      >
        <span className="sr-only">
          {status === "loading" ? "Verificando sua sessão" : "Redirecionando para o acesso"}
        </span>
        <Skeleton className="mb-3 h-6 w-40" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return <>{children}</>;
}
