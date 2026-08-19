/** Tipos do domínio de autenticação — só o que é do formulário. Os tipos do
 *  contrato (RegisterInput, LoginInput, Session) vivem em shared/types.ts,
 *  junto com o utilitário `FieldErrors`, usado também por outros domínios. */

export type { FieldErrors } from "@/domain/shared/types";

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  /** Só existe no front. O back-end não conhece este campo. */
  passwordConfirmation: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}
