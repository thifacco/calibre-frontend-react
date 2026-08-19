"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import * as authService from "../services/authService";
import { normalizeEmail, toFormErrorState, validateRegister } from "../validation";
import type { FieldErrors, RegisterFormValues } from "../types";
import { useSession } from "./useSession";

/**
 * Orquestra o cadastro. O componente não sabe de rota nem de endpoint: recebe
 * `submit`, os erros e o estado de envio prontos.
 *
 * O back-end não devolve token no cadastro, então autenticar exige um segundo
 * passo: `POST /api/users` e em seguida `POST /api/session` com as mesmas
 * credenciais. É por isso que o fluxo tem duas chamadas, não porque falta uma
 * rota — o contrato é assim.
 */

/** Campos que o back-end pode citar em `details`. `passwordConfirmation` não
 *  entra: é regra só do front. */
const CAMPOS_DO_BACKEND = ["name", "email", "password"] as const;

export interface UseRegisterResult {
  submit: (values: RegisterFormValues) => Promise<void>;
  submitting: boolean;
  fieldErrors: FieldErrors<RegisterFormValues>;
  formError: string | null;
}

export function useRegister(): UseRegisterResult {
  const { signIn } = useSession();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = useCallback(
    async (values: RegisterFormValues) => {
      const errosLocais = validateRegister(values);
      if (Object.keys(errosLocais).length > 0) {
        setFieldErrors(errosLocais);
        setFormError(null);
        return;
      }

      setFieldErrors({});
      setFormError(null);
      setSubmitting(true);

      const email = normalizeEmail(values.email);

      try {
        await authService.register({
          name: values.name.trim(),
          email,
          password: values.password,
        });
      } catch (error) {
        const estado = toFormErrorState<RegisterFormValues>(error, CAMPOS_DO_BACKEND);
        setFieldErrors(estado.fieldErrors);
        setFormError(estado.formError);
        setSubmitting(false);
        return;
      }

      // A conta já existe a partir daqui. Se o login falhar, não é caso de
      // mostrar erro de cadastro — seria mentira. Manda para o formulário de
      // login com a conta criada.
      try {
        const sessao = await authService.login({ email, password: values.password });
        signIn(authService.toSession(sessao));
        router.push("/dashboard");
      } catch {
        setFormError("Conta criada, mas não foi possível entrar automaticamente. Use o formulário de acesso abaixo.");
      } finally {
        setSubmitting(false);
      }
    },
    [signIn, router],
  );

  return { submit, submitting, fieldErrors, formError };
}
