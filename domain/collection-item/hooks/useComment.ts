"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import * as commentService from "../services/commentService";
import { useSession } from "@/domain/auth/hooks/useSession";
import { isApiError } from "@/domain/shared/services/ApiError";
import { MAX_COMMENT_LENGTH } from "../types";

/**
 * Comentar num item.
 *
 * Como não existe `GET` de comentários no contrato, o retorno visível é o
 * contador subindo — a conversa não aparece. Por isso o hook devolve
 * `justSent`: sem uma confirmação explícita, o usuário escreve, o texto some e
 * nada parece ter acontecido.
 *
 * O rascunho é estado **do hook**, não do componente. Assim o campo é limpo no
 * próprio callback de sucesso, em vez de num `useEffect` reagindo a `justSent`
 * — que é o `setState` em efeito reprovado pelo React 19.
 */

export interface UseCommentResult {
  content: string;
  setContent: (content: string) => void;
  submit: () => void;
  submitting: boolean;
  error: string | null;
  /** Verdadeiro logo após um envio bem-sucedido. */
  justSent: boolean;
}

export function useComment(itemId: string, onCommented: () => void): UseCommentResult {
  const { token, handleUnauthorized } = useSession();
  const router = useRouter();

  const [content, setContentState] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSent, setJustSent] = useState(false);

  const setContent = useCallback((valor: string) => {
    setContentState(valor);
    // Digitar de novo apaga o resultado do envio anterior: a mensagem antiga
    // não descreve mais o que está no campo.
    setError(null);
    setJustSent(false);
  }, []);

  const submit = useCallback(() => {
    if (token === null) {
      router.push("/cadastro");
      return;
    }

    const texto = content.trim();

    if (texto === "") {
      setError("Escreva algo antes de enviar.");
      return;
    }

    if (texto.length > MAX_COMMENT_LENGTH) {
      setError(`O comentário passa de ${MAX_COMMENT_LENGTH} caracteres.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    setJustSent(false);

    void commentService
      .comment(itemId, texto, token)
      .then(() => {
        setContentState("");
        setJustSent(true);
        onCommented();
      })
      .catch((erro: unknown) => {
        if (handleUnauthorized(erro)) return;
        setError(isApiError(erro) ? erro.message : "Não foi possível enviar seu comentário.");
      })
      .finally(() => setSubmitting(false));
  }, [itemId, content, token, onCommented, handleUnauthorized, router]);

  return { content, setContent, submit, submitting, error, justSent };
}
