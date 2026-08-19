"use client";

import { useSession } from "../hooks/useSession";

/**
 * Cabeçalho do dashboard enquanto a coleção não existe. Serve de prova de que
 * a sessão chegou até a rota autenticada — some quando o domínio
 * `collection-item` trouxer a contagem real de relógios.
 */
export function DashboardGreeting() {
  const { session } = useSession();

  return (
    <header data-testid="cabecalho-dashboard">
      <p className="text-xs text-muted-foreground">Minha coleção</p>
      <h1 className="mt-0.5 text-xl">{session?.userName ?? "Bem-vindo"}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Sua coleção ainda não aparece aqui — a lista e o formulário de novo relógio entram na
        próxima etapa.
      </p>
    </header>
  );
}
