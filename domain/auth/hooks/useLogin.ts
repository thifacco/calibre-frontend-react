"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import * as authService from "../services/authService";
import { normalizeEmail, toFormErrorState, validateLogin } from "../validation";
import type { FieldErrors, LoginFormValues } from "../types";
import { useSession } from "./useSession";

const CAMPOS_DO_BACKEND = ["email", "password"] as const;

export interface UseLoginResult {
  submit: (values: LoginFormValues) => Promise<void>;
  submitting: boolean;
  fieldErrors: FieldErrors<LoginFormValues>;
  formError: string | null;
}

export function useLogin(): UseLoginResult {
  const { signIn } = useSession();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = useCallback(
    async (values: LoginFormValues) => {
      const errosLocais = validateLogin(values);
      if (Object.keys(errosLocais).length > 0) {
        setFieldErrors(errosLocais);
        setFormError(null);
        return;
      }

      setFieldErrors({});
      setFormError(null);
      setSubmitting(true);

      try {
        const sessao = await authService.login({
          email: normalizeEmail(values.email),
          password: values.password,
        });

        signIn(authService.toSession(sessao));
        router.push("/dashboard");
      } catch (error) {
        // 401 aqui é credencial errada, não sessão expirada — por isso este
        // hook não usa `handleUnauthorized`: não há sessão para derrubar, e
        // redirecionar para /cadastro seria tirar o usuário da própria tela
        // em que ele está tentando entrar.
        const estado = toFormErrorState<LoginFormValues>(error, CAMPOS_DO_BACKEND);
        setFieldErrors(estado.fieldErrors);
        setFormError(estado.formError);
      } finally {
        setSubmitting(false);
      }
    },
    [signIn, router],
  );

  return { submit, submitting, fieldErrors, formError };
}
