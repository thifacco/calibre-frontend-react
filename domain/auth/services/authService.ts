import { request } from "@/domain/shared/services/httpClient";
import type {
  LoginInput,
  RegisterInput,
  Session,
  SessionResponse,
  UserResponse,
} from "@/domain/shared/types";

/**
 * Chamadas HTTP de autenticação. Sem React aqui — nem hook, nem contexto.
 * Ambas as rotas são públicas, então nenhuma recebe token.
 */

/** POST /api/users — 201. Não devolve token: quem autentica é o login. */
export function register(input: RegisterInput): Promise<UserResponse> {
  return request<UserResponse>("/api/users", { method: "POST", body: input });
}

/** POST /api/session — 200. 401 com "E-mail ou senha inválidos". */
export function login(input: LoginInput): Promise<SessionResponse> {
  return request<SessionResponse>("/api/session", { method: "POST", body: input });
}

/**
 * O back-end devolve `name`; a sessão guarda `userName`, para casar com o
 * `userName` de todo FeedItem e não existirem dois nomes para a mesma coisa
 * na UI. A tradução mora aqui, na fronteira com o contrato.
 */
export function toSession(response: SessionResponse): Session {
  return {
    token: response.token,
    userId: response.userId,
    userName: response.name,
  };
}
