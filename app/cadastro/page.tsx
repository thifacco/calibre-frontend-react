import type { Metadata } from "next";
import { RegisterForm } from "@/domain/auth/components/RegisterForm";
import { LoginForm } from "@/domain/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Entre para o clube — Calibre",
};

/**
 * Página fina: só compõe. O cadastro e o acesso convivem aqui porque o MVP
 * tem três rotas e nenhuma delas é "/login" — e deixar os dois formulários
 * visíveis, em vez de escondidos atrás de abas, mantém o fluxo operável por
 * DOM sem precisar descobrir qual aba abrir primeiro.
 */
export default function CadastroPage() {
  return (
    <div className="mx-auto w-full max-w-[22.5rem] px-6 py-12">
      <section aria-labelledby="cadastro-titulo">
        <h1 id="cadastro-titulo" className="mb-1.5 text-center text-xl">
          Entre para o clube
        </h1>
        <p className="mb-7 text-center text-sm text-muted-foreground">
          Escolha uma senha e comece a contar as histórias da sua coleção.
        </p>

        <RegisterForm />
      </section>

      <div className="my-10 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <section aria-labelledby="login-titulo">
        <h2 id="login-titulo" className="mb-1.5 text-center text-lg">
          Já é membro?
        </h2>
        <p className="mb-7 text-center text-sm text-muted-foreground">
          Entre com o e-mail e a senha que você cadastrou.
        </p>

        <LoginForm />
      </section>
    </div>
  );
}
