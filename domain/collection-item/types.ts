import type { MovementType, ReactionType } from "@/domain/shared/types";

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

/* ------------------------------------------------------------------ *
 * Formulário de novo item
 * ------------------------------------------------------------------ */

/** Rótulos dos tipos de movimento. As chaves são o enum do contrato. */
export const MOVEMENT_LABELS: Record<MovementType, string> = {
  MANUAL: "Corda manual",
  AUTOMATIC: "Automático",
  QUARTZ: "Quartzo",
  ECO_DRIVE: "Eco-Drive",
  SPRING_DRIVE: "Spring Drive",
  OTHER: "Outro",
};

export const MOVEMENT_ORDER: readonly MovementType[] = [
  "MANUAL",
  "AUTOMATIC",
  "QUARTZ",
  "ECO_DRIVE",
  "SPRING_DRIVE",
  "OTHER",
];

/** Limites espelhados do `newItemSchema` do back-end. */
export const LIMITES = {
  brand: 120,
  model: 120,
  referenceNumber: 120,
  acquiredContext: 2000,
  memoryStory: 10000,
  anoMinimo: 1800,
} as const;

/**
 * Todos os campos são string porque vêm de input — a conversão para número e
 * para array acontece no hook, na fronteira com o contrato.
 */
export interface NewItemFormValues {
  brand: string;
  model: string;
  referenceNumber: string;
  movementType: string;
  acquiredYear: string;
  acquiredContext: string;
  /** Uma URL. O contrato aceita até 10, mas não há upload nesta fase. */
  photos: string;
  memoryStory: string;
}
