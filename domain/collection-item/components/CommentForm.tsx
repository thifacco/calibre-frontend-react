"use client";

import { useCallback, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useComment } from "../hooks/useComment";
import { MAX_COMMENT_LENGTH } from "../types";

/**
 * Painel de comentário de um item. Aparece abaixo da barra de reações quando
 * o usuário aciona "Comentar".
 *
 * O `id` é derivado do id do item, que vem do back-end e não muda: continua
 * estável e previsível como o requisito AI-first exige, sem `useId()`, e ainda
 * assim único quando vários posts têm o painel aberto.
 */

export interface CommentFormProps {
  itemId: string;
  onCommented: () => void;
  onClose: () => void;
}

export function CommentForm({ itemId, onCommented, onClose }: CommentFormProps) {
  const { content, setContent, submit, submitting, error, justSent } = useComment(
    itemId,
    onCommented,
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const campoId = `comentario-${itemId}`;

  // Abrir o painel e ter que caçar o campo com o mouse é ruído; para quem
  // navega por teclado, é o passo que faz o fluxo travar. Mover foco é efeito
  // sobre o DOM, não estado do React — é uso legítimo de useEffect.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => setContent(event.target.value),
    [setContent],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submit();
    },
    [submit],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-3 border-t border-border pt-3">
      <Label htmlFor={campoId} className="mb-1.5 text-xs text-muted-foreground">
        Seu comentário
      </Label>
      <Textarea
        id={campoId}
        name="content"
        ref={textareaRef}
        rows={2}
        maxLength={MAX_COMMENT_LENGTH}
        placeholder="Responda a esta história"
        value={content}
        onChange={handleChange}
        aria-invalid={error !== null}
        aria-describedby={error !== null ? `${campoId}-erro` : undefined}
        data-testid="campo-comentario"
      />

      {error !== null && (
        <p id={`${campoId}-erro`} role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}

      {/*
        Sem GET de comentários no contrato, a thread não aparece. Esta é a
        única confirmação de que o comentário chegou — sem ela o texto some e
        parece que nada aconteceu.
      */}
      {justSent && (
        <p role="status" data-testid="comentario-enviado" className="mt-1.5 text-xs text-primary">
          Comentário enviado.
        </p>
      )}

      <div className="mt-2.5 flex items-center gap-2">
        <Button type="submit" size="sm" disabled={submitting} data-testid="botao-enviar-comentario">
          {submitting ? "Enviando..." : "Enviar"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
