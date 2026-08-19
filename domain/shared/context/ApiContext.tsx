"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Session, SessionStatus } from "../types";

/**
 * Estado de sessão compartilhado. É o único lugar que lê e escreve o token —
 * services recebem o token como parâmetro, resolvido pelo hook a partir daqui.
 *
 * A leitura do localStorage passa por `useSyncExternalStore`, não por
 * `useEffect` + `setState`. Ler storage num efeito e chamar setState reprova a
 * regra `react-hooks/set-state-in-effect` do React 19, e este é o primitivo
 * feito para estado que vive fora do React: ele já trata o descompasso entre
 * servidor e cliente e, de quebra, sincroniza abas pelo evento `storage`.
 */

const STORAGE_KEY = "calibre.session";

/**
 * `loading` não é decorativo. Na hidratação o React usa o snapshot do
 * servidor, onde não existe localStorage para ler. Quem tratar esse primeiro
 * render como `anonymous` manda o dashboard de volta para /cadastro a cada
 * F5, mesmo com sessão válida.
 */
export type { SessionStatus };

export interface SessionState {
  status: SessionStatus;
  session: Session | null;
}

export interface ApiContextValue extends SessionState {
  signIn: (session: Session) => void;
  signOut: () => void;
}

/* ------------------------------------------------------------------ *
 * Store externo. Vive fora do React porque o localStorage também vive.
 * ------------------------------------------------------------------ */

const SERVER_STATE: SessionState = { status: "loading", session: null };
const ANONYMOUS_STATE: SessionState = { status: "anonymous", session: null };

/** `null` = ainda não lido nesta aba. Cacheado porque `getSnapshot` precisa
 *  devolver referência estável — recalcular a cada chamada gera loop de render. */
let snapshot: SessionState | null = null;

const listeners = new Set<() => void>();

/** O que veio do localStorage é entrada não confiável — pode estar corrompido. */
function parseStoredSession(raw: string): Session | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const { token, userId, userName } = parsed as Record<string, unknown>;
    if (typeof token !== "string" || token === "") return null;
    if (typeof userId !== "string" || userId === "") return null;
    if (typeof userName !== "string") return null;

    return { token, userId, userName };
  } catch {
    return null;
  }
}

function readFromStorage(): Session | null {
  // Pode lançar em modo privativo ou com storage desabilitado. Sem persistência
  // o app segue funcionando — a sessão só não sobrevive ao F5.
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;

    const parsed = parseStoredSession(raw);
    if (parsed === null) window.localStorage.removeItem(STORAGE_KEY);
    return parsed;
  } catch {
    return null;
  }
}

function toState(session: Session | null): SessionState {
  return session === null ? ANONYMOUS_STATE : { status: "authenticated", session };
}

function notify(): void {
  for (const listener of listeners) listener();
}

function handleStorageEvent(event: StorageEvent): void {
  // `key` nulo é o storage inteiro sendo limpo — aí também nos afeta.
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  snapshot = toState(readFromStorage());
  notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleStorageEvent);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorageEvent);
  };
}

function getSnapshot(): SessionState {
  snapshot ??= toState(readFromStorage());
  return snapshot;
}

function getServerSnapshot(): SessionState {
  return SERVER_STATE;
}

/**
 * Grava e avisa. O snapshot é montado a partir do argumento, não relido do
 * storage: se a escrita falhou (modo privativo), a sessão continua valendo em
 * memória nesta aba em vez de sumir no render seguinte.
 */
function setStoredSession(next: Session | null): void {
  try {
    if (next === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Sessão só na memória desta aba. Não é motivo para barrar o login.
  }

  snapshot = toState(next);
  notify();
}

/* ------------------------------------------------------------------ *
 * Contexto
 * ------------------------------------------------------------------ */

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const signIn = useCallback((session: Session) => setStoredSession(session), []);
  const signOut = useCallback(() => setStoredSession(null), []);

  const value = useMemo<ApiContextValue>(
    () => ({ status: state.status, session: state.session, signIn, signOut }),
    [state, signIn, signOut],
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiContextValue {
  const value = useContext(ApiContext);
  if (value === null) {
    throw new Error("useApi precisa estar dentro de <ApiProvider>. Ver app/layout.tsx.");
  }
  return value;
}
