/**
 * Espelho dos tipos do contrato do back-end (`src/shared/contracts.ts` em
 * calibre-backend-node). O back-end é a fonte da verdade: divergiu, é aqui
 * que se corrige, e mudar qualquer coisa deste arquivo significa que o
 * contrato mudou lá primeiro.
 */

export type ReactionType = "TOUCHED" | "CURIOUS" | "SAME_STORY";

export type MovementType =
  | "MANUAL"
  | "AUTOMATIC"
  | "QUARTZ"
  | "ECO_DRIVE"
  | "SPRING_DRIVE"
  | "OTHER";

export interface ReactionCounts {
  touched: number;
  curious: number;
  sameStory: number;
}

export interface FeedItem {
  id: string;
  userId: string;
  /** Desnormalizado pelo back-end — o front não busca usuário separado. */
  userName: string;
  brand: string;
  model: string;
  referenceNumber?: string;
  movementType?: MovementType;
  acquiredYear?: number;
  acquiredContext?: string;
  memoryStory: string;
  photos: string[];
  reactionCounts: ReactionCounts;
  commentCount: number;
  /** ISO 8601. */
  createdAt: string;
}

export interface FeedResponse {
  items: FeedItem[];
  /** String opaca. O front devolve o que recebeu; `null` é fim da lista. */
  nextCursor: string | null;
}

export interface UserItemsResponse {
  items: FeedItem[];
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

/** Resposta de POST /api/session. Note `name`, não `userName`. */
export interface SessionResponse {
  token: string;
  userId: string;
  name: string;
}

export interface CommentResponse {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

/** Resposta de POST /api/items/:id/reactions — contadores já atualizados. */
export interface ReactionResponse {
  reactionCounts: ReactionCounts;
}

export interface NewCollectionItemInput {
  brand: string;
  model: string;
  referenceNumber?: string;
  movementType?: MovementType;
  acquiredYear?: number;
  acquiredContext?: string;
  memoryStory: string;
  photos?: string[];
}

/* ------------------------------------------------------------------ *
 * Tipos do front, sem equivalente no contrato.
 * ------------------------------------------------------------------ */

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Sessão como o front a guarda. Difere de `SessionResponse`: `name` vira
 * `userName`, para casar com o `userName` que todo `FeedItem` carrega e não
 * existir dois nomes para a mesma coisa na UI.
 */
export interface Session {
  token: string;
  userId: string;
  userName: string;
}
