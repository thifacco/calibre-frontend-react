import { isApiError } from "@/domain/shared/services/ApiError";
import type { FieldErrors, LoginFormValues, RegisterFormValues } from "./types";

/**
 * Funções puras: validação antes do envio e tradução de ApiError em erro de
 * campo. Não importam React nem HTTP — ficam fora de /services porque ali só
 * mora chamada de rede.
 *
 * As regras espelham os schemas zod do back-end. Elas existem para dar
 * resposta imediata, não para substituir a validação de lá: quem valida de
 * verdade é o servidor, e o 400 dele continua sendo tratado.
 */

/** Espelha `z.string().min(8)` do userController. */
export const MIN_PASSWORD_LENGTH = 8;

/** Deliberadamente frouxo: o `type="email"` do input e o `z.email()` do
 *  back-end são as checagens de verdade. Aqui só se pega o erro grosseiro. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** O back-end grava o e-mail em minúsculas. Normalizar antes de enviar deixa
 *  o login logo após o cadastro determinístico. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateRegister(values: RegisterFormValues): FieldErrors<RegisterFormValues> {
  const errors: FieldErrors<RegisterFormValues> = {};

  if (values.name.trim() === "") errors.name = "Informe seu nome.";
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Informe um e-mail válido.";

  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  // Confirmação é regra só do front — por isso a checagem acontece aqui e o
  // back-end nunca devolve erro para este campo.
  if (values.passwordConfirmation === "") {
    errors.passwordConfirmation = "Repita a senha.";
  } else if (values.passwordConfirmation !== values.password) {
    errors.passwordConfirmation = "As senhas não são iguais.";
  }

  return errors;
}

export function validateLogin(values: LoginFormValues): FieldErrors<LoginFormValues> {
  const errors: FieldErrors<LoginFormValues> = {};

  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Informe um e-mail válido.";
  if (values.password === "") errors.password = "Informe sua senha.";

  return errors;
}

export interface FormErrorState<TValues> {
  fieldErrors: FieldErrors<TValues>;
  /** Erro que não pertence a nenhum campo — vai para o topo do formulário. */
  formError: string | null;
}

/**
 * Traduz o erro do back-end em mensagens de campo.
 *
 * O `field` que vem em `details` é o caminho do zod (`name`, `email`,
 * `password`), que casa com o `name` do input. `knownFields` evita que um
 * campo desconhecido suma: o que não casa vira erro de formulário.
 */
export function toFormErrorState<TValues>(
  error: unknown,
  knownFields: ReadonlyArray<keyof TValues & string>,
): FormErrorState<TValues> {
  if (!isApiError(error)) {
    return {
      fieldErrors: {},
      formError: "Algo deu errado. Tente novamente.",
    };
  }

  if (error.status === 400 && error.details !== undefined) {
    const fieldErrors: FieldErrors<TValues> = {};
    const semDono: string[] = [];

    for (const detail of error.details) {
      if ((knownFields as readonly string[]).includes(detail.field)) {
        fieldErrors[detail.field as keyof TValues] = detail.message;
      } else {
        semDono.push(detail.message);
      }
    }

    return {
      fieldErrors,
      formError: semDono.length > 0 ? semDono.join(" ") : null,
    };
  }

  // 409 no cadastro é sempre e-mail duplicado — o único índice único que a
  // rota pode violar. Mostrar no campo poupa o usuário de caçar o motivo.
  if (error.status === 409 && (knownFields as readonly string[]).includes("email")) {
    return {
      fieldErrors: { ["email" as keyof TValues]: error.message } as FieldErrors<TValues>,
      formError: null,
    };
  }

  return { fieldErrors: {}, formError: error.message };
}
