import type { Metadata } from "next";
import { RequireAuth } from "@/domain/auth/components/RequireAuth";
import { DashboardCollection } from "@/domain/collection-item/components/DashboardCollection";

export const metadata: Metadata = {
  title: "Minha coleção — Calibre",
};

/**
 * Página fina: só compõe. O `RequireAuth` decide o acesso; a coleção e o
 * formulário vêm do domínio `collection-item`.
 */
export default function DashboardPage() {
  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-2xl">
        <DashboardCollection />
      </div>
    </RequireAuth>
  );
}
