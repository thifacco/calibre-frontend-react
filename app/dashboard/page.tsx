import type { Metadata } from "next";
import { RequireAuth } from "@/domain/auth/components/RequireAuth";
import { DashboardGreeting } from "@/domain/auth/components/DashboardGreeting";

export const metadata: Metadata = {
  title: "Minha coleção — Calibre",
};

/**
 * Esqueleto do dashboard. Existe agora porque o login precisa ter para onde
 * mandar o usuário e o `RequireAuth` precisa de uma rota para guardar.
 *
 * A lista da coleção e o formulário de novo relógio entram com o domínio
 * `collection-item`.
 */
export default function DashboardPage() {
  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-2xl px-5 py-6">
        <DashboardGreeting />
      </div>
    </RequireAuth>
  );
}
