"use client";

import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "../hooks/useRegister";
import { MIN_PASSWORD_LENGTH } from "../validation";
import type { RegisterFormValues } from "../types";

/**
 * Formulário de cadastro. Os `id` são literais e estáveis — nada de `useId()`:
 * é requisito AI-first, o seletor de hoje precisa valer amanhã. Os nomes estão
 * fixados na tabela do ARQUITETURA.md e não devem ser reinventados aqui.
 */

const VALORES_INICIAIS: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
};

export function RegisterForm() {
  const { submit, submitting, fieldErrors, formError } = useRegister();
  const [values, setValues] = useState<RegisterFormValues>(VALORES_INICIAIS);

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
    // `noValidate` desliga o balão nativo do browser para as mensagens ficarem
    // no DOM, legíveis por leitor de tela e por agente. A validação continua
    // acontecendo — em `validateRegister`.
    <form onSubmit={handleSubmit} noValidate aria-labelledby="cadastro-titulo">
      {formError !== null && (
        <p
          role="alert"
          data-testid="erro-cadastro"
          className="mb-5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground"
        >
          {formError}
        </p>
      )}

      <div className="mb-4">
        <Label htmlFor="cadastro-nome" className="mb-1.5 text-muted-foreground">
          Nome
        </Label>
        <Input
          id="cadastro-nome"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Seu nome completo"
          value={values.name}
          onChange={handleChange}
          aria-invalid={fieldErrors.name !== undefined}
          aria-describedby={fieldErrors.name !== undefined ? "cadastro-nome-erro" : undefined}
        />
        {fieldErrors.name !== undefined && (
          <p id="cadastro-nome-erro" role="alert" className="mt-1.5 text-xs text-destructive">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="cadastro-email" className="mb-1.5 text-muted-foreground">
          E-mail
        </Label>
        <Input
          id="cadastro-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nome@email.com"
          value={values.email}
          onChange={handleChange}
          aria-invalid={fieldErrors.email !== undefined}
          aria-describedby={fieldErrors.email !== undefined ? "cadastro-email-erro" : undefined}
        />
        {fieldErrors.email !== undefined && (
          <p id="cadastro-email-erro" role="alert" className="mt-1.5 text-xs text-destructive">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="cadastro-senha" className="mb-1.5 text-muted-foreground">
          Senha
        </Label>
        <Input
          id="cadastro-senha"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={`Ao menos ${MIN_PASSWORD_LENGTH} caracteres`}
          value={values.password}
          onChange={handleChange}
          aria-invalid={fieldErrors.password !== undefined}
          aria-describedby={fieldErrors.password !== undefined ? "cadastro-senha-erro" : undefined}
        />
        {fieldErrors.password !== undefined && (
          <p id="cadastro-senha-erro" role="alert" className="mt-1.5 text-xs text-destructive">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div className="mb-6">
        <Label htmlFor="cadastro-senha-confirmacao" className="mb-1.5 text-muted-foreground">
          Confirme a senha
        </Label>
        <Input
          id="cadastro-senha-confirmacao"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
          value={values.passwordConfirmation}
          onChange={handleChange}
          aria-invalid={fieldErrors.passwordConfirmation !== undefined}
          aria-describedby={
            fieldErrors.passwordConfirmation !== undefined
              ? "cadastro-senha-confirmacao-erro"
              : undefined
          }
        />
        {fieldErrors.passwordConfirmation !== undefined && (
          <p
            id="cadastro-senha-confirmacao-erro"
            role="alert"
            className="mt-1.5 text-xs text-destructive"
          >
            {fieldErrors.passwordConfirmation}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={submitting}
        data-testid="botao-cadastro"
      >
        {submitting ? "Criando sua conta..." : "Criar minha conta"}
      </Button>
    </form>
  );
}
