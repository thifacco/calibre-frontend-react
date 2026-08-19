"use client";

import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "../hooks/useLogin";
import type { LoginFormValues } from "../types";

const VALORES_INICIAIS: LoginFormValues = { email: "", password: "" };

export function LoginForm() {
  const { submit, submitting, fieldErrors, formError } = useLogin();
  const [values, setValues] = useState<LoginFormValues>(VALORES_INICIAIS);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((atual) => ({ ...atual, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submit(values);
    },
    [submit, values],
  );

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="login-titulo">
      {formError !== null && (
        <p
          role="alert"
          data-testid="erro-login"
          className="mb-5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground"
        >
          {formError}
        </p>
      )}

      <div className="mb-4">
        <Label htmlFor="login-email" className="mb-1.5 text-muted-foreground">
          E-mail
        </Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nome@email.com"
          value={values.email}
          onChange={handleChange}
          aria-invalid={fieldErrors.email !== undefined}
          aria-describedby={fieldErrors.email !== undefined ? "login-email-erro" : undefined}
        />
        {fieldErrors.email !== undefined && (
          <p id="login-email-erro" role="alert" className="mt-1.5 text-xs text-destructive">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="mb-6">
        <Label htmlFor="login-senha" className="mb-1.5 text-muted-foreground">
          Senha
        </Label>
        <Input
          id="login-senha"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={values.password}
          onChange={handleChange}
          aria-invalid={fieldErrors.password !== undefined}
          aria-describedby={fieldErrors.password !== undefined ? "login-senha-erro" : undefined}
        />
        {fieldErrors.password !== undefined && (
          <p id="login-senha-erro" role="alert" className="mt-1.5 text-xs text-destructive">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={submitting}
        data-testid="botao-login"
      >
        {submitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
