/**
 * Erro vindo do back-end, já traduzido do shape `{ error: { message, details } }`.
 *
 * Existe para o hook decidir comportamento por `status` sem destrinchar JSON:
 * `err instanceof ApiError && err.status === 409`. Só o httpClient constrói
 * isto — nenhuma outra camada deve lançar ApiError.
 */

/** Item de `details`, presente só em 400 de validação. `field` casa com o `name` do input. */
export interface ApiErrorDetail {
  field: string;
  message: string;
}

/**
 * Status usado quando a requisição nem chegou a ter resposta HTTP — servidor
 * fora do ar, DNS, rede caída. Não é status do protocolo: é a marca de que
 * não houve resposta nenhuma para ler.
 */
export const NETWORK_ERROR_STATUS = 0;

export class ApiError extends Error {
  readonly status: number;
  readonly details?: ApiErrorDetail[];

  constructor(status: number, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (details !== undefined) this.details = details;
  }

  /** Verdadeiro quando não houve resposta HTTP — ver NETWORK_ERROR_STATUS. */
  get isNetworkError(): boolean {
    return this.status === NETWORK_ERROR_STATUS;
  }

  /**
   * Sessão morta. O hook que receber isto numa rota autenticada deve chamar
   * `signOut()` — não existe refresh token no contrato.
   */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Mensagem de um campo específico, quando o back-end mandou `details`. */
  detailFor(field: string): string | undefined {
    return this.details?.find((detail) => detail.field === field)?.message;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
