import type { ReactionType } from "@/domain/shared/types";

/** Rótulos das três reações. Vêm do brief e aparecem como `aria-label` —
 *  são o que o agente lê para saber em qual botão clicar. */
export const REACTION_LABELS: Record<ReactionType, string> = {
  TOUCHED: "Me tocou",
  CURIOUS: "Quero saber mais",
  SAME_STORY: "Tenho uma história parecida",
};

/** Sufixo do `data-testid` de cada botão de reação, fixado no ARQUITETURA.md. */
export const REACTION_TESTIDS: Record<ReactionType, string> = {
  TOUCHED: "botao-reacao-touched",
  CURIOUS: "botao-reacao-curious",
  SAME_STORY: "botao-reacao-same-story",
};

/** Ordem de exibição — a mesma do wireframe. */
export const REACTION_ORDER: readonly ReactionType[] = ["TOUCHED", "CURIOUS", "SAME_STORY"];

/** Espelha `commentSchema` do back-end: trim, mínimo 1, máximo 2000. */
export const MAX_COMMENT_LENGTH = 2000;
