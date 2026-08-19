/** Tipos do domínio de autenticação — só o que é do formulário. Os tipos do
 *  contrato (RegisterInput, LoginInput, Session) vivem em shared/types.ts. */

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

/** Mensagem por campo. A chave casa com o `name` do input e com o `field`
 *  que o back-end manda em `details` no 400. */
export type FieldErrors<TValues> = Partial<Record<keyof TValues, string>>;
