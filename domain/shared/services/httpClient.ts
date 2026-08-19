import { ApiError, NETWORK_ERROR_STATUS, type ApiErrorDetail } from "./ApiError";

/**
 * Único módulo do projeto que conhece `fetch`, a base URL e o shape de erro
 * do back-end. Nenhum componente e nenhum hook chama `fetch` direto.
 *
 * Não faz retry, não faz cache e não redireciona: redirecionar é decisão de
 * UI e vive no hook. Ver ARQUITETURA.md.
 */

/**
 * Vazia no ambiente local, e isso é intencional: vazia significa same-origin,
 * o caminho fica relativo (`/api/feed`) e o rewrite do `next.config.ts`
 * encaminha para o back-end. Preenchê-la com uma origem real tira o proxy do
 * caminho — e aí o back-end precisa de CORS.
 */
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export type QueryValue = string | number | undefined;

export interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  /** Resolvido pelo hook a partir do ApiContext. Nunca lido de global aqui. */
  token?: string;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

/**
 * Monta a query string descartando chaves `undefined`.
 *
 * Descarta apenas `undefined`, não string vazia: decidir que "busca vazia" é
 * "sem filtro" é regra de domínio, e cabe ao hook mandar `undefined`. Aqui
 * `q: ""` vira `?q=` de propósito.
 */
function buildQuery(query: Record<string, QueryValue> | undefined): string {
  if (query === undefined) return "";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }

  const serialized = params.toString();
  return serialized === "" ? "" : `?${serialized}`;
}

interface BackendErrorBody {
  error?: { message?: unknown; details?: unknown };
}

function parseDetails(raw: unknown): ApiErrorDetail[] | undefined {
  if (!Array.isArray(raw)) return undefined;

  const details = raw.flatMap((entry): ApiErrorDetail[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const { field, message } = entry as Record<string, unknown>;
    if (typeof field !== "string" || typeof message !== "string") return [];
    return [{ field, message }];
  });

  return details.length > 0 ? details : undefined;
}

/**
 * Traduz a resposta de erro em ApiError.
 *
 * O corpo nem sempre é o JSON do back-end: quando o proxy do Next não alcança
 * a porta 4000, ele devolve `Internal Server Error` em texto puro. Por isso a
 * leitura é tolerante — um `res.json()` seco quebraria o cliente justamente
 * quando o back-end está fora do ar.
 */
async function toApiError(response: Response): Promise<ApiError> {
  const raw = await response.text().catch(() => "");

  let parsed: BackendErrorBody | undefined;
  try {
    parsed = raw === "" ? undefined : (JSON.parse(raw) as BackendErrorBody);
  } catch {
    parsed = undefined;
  }

  const message =
    typeof parsed?.error?.message === "string"
      ? parsed.error.message
      : raw.trim() || response.statusText || `Erro HTTP ${response.status}`;

  return new ApiError(response.status, message, parseDetails(parsed?.error?.details));
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, query, signal } = options;

  const headers: Record<string, string> = { accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (token !== undefined) headers["authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}${buildQuery(query)}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(signal !== undefined ? { signal } : {}),
    });
  } catch (error) {
    // Aborto pedido pelo chamador não é falha de rede — deixa passar cru para
    // o hook distinguir "cancelei" de "não consegui falar com o servidor".
    if (error instanceof DOMException && error.name === "AbortError") throw error;

    throw new ApiError(
      NETWORK_ERROR_STATUS,
      "Não foi possível falar com o servidor. Verifique se o back-end está no ar.",
    );
  }

  if (!response.ok) throw await toApiError(response);

  // 204 e corpo vazio: rota que não devolve nada. Nenhuma do contrato atual
  // faz isso, mas um `res.json()` seco quebraria se alguma passasse a fazer.
  if (response.status === 204) return undefined as T;

  const raw = await response.text();
  if (raw === "") return undefined as T;

  return JSON.parse(raw) as T;
}
