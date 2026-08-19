"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/domain/shared/context/ApiContext";
import { isApiError } from "@/domain/shared/services/ApiError";
import type { Session, SessionStatus } from "@/domain/shared/types";

/**
 * Fachada do domínio auth sobre o ApiContext. Existe por dois motivos além de
 * repassar o contexto:
 *
 * - entrega o `token` já desembrulhado, que é o que os hooks dos outros
 *   domínios precisam passar aos services;
 * - concentra num lugar só a política de 401. Espalhar `signOut()` +
 *   redirect por cada hook garante que um deles vai esquecer, e a tela fica
 *   com sessão morta batendo em rota autenticada.
 */

export interface UseSessionResult {
  status: SessionStatus;
  session: Session | null;
  token: string | null;
  signIn: (session: Session) => void;
  signOut: () => void;
  /**
   * Trata o erro se for 401: desloga e manda para /cadastro.
   * Devolve `true` quando tratou — aí o chamador não deve mostrar mensagem,
   * porque a tela já está saindo.
   */
  handleUnauthorized: (error: unknown) => boolean;
}

export function useSession(): UseSessionResult {
  const { status, session, signIn, signOut } = useApi();
  const router = useRouter();

  const handleUnauthorized = useCallback(
    (error: unknown): boolean => {
      if (!isApiError(error) || !error.isUnauthorized) return false;

      signOut();
      router.push("/cadastro");
      return true;
    },
    [signOut, router],
  );

  return {
    status,
    session,
    token: session?.token ?? null,
    signIn,
    signOut,
    handleUnauthorized,
  };
}
