"use client";

import { useUserItems } from "../hooks/useUserItems";
import { CollectionItemList } from "./CollectionItemList";
import { NewItemForm } from "./NewItemForm";

/**
 * Junta a lista da coleção e o formulário de novo relógio. Existe para o
 * `useUserItems` ser compartilhado pelos dois — o item recém-criado entra no
 * topo da lista sem refazer a requisição — e para `app/dashboard/page.tsx`
 * continuar fina.
 */
export function DashboardCollection() {
  const { items, status, error, retry, prepend } = useUserItems();

  return (
    <>
      <header className="px-5 pt-6">
        <p className="text-xs text-muted-foreground">Minha coleção</p>
        <h1 className="mt-0.5 text-xl" data-testid="contagem-colecao">
          {status === "ready"
            ? `${items.length} ${items.length === 1 ? "relógio" : "relógios"}`
            : "Minha coleção"}
        </h1>
      </header>

      <div className="px-5 pt-4">
        <CollectionItemList items={items} status={status} error={error} onRetry={retry} />
      </div>

      <section
        aria-labelledby="novo-item-titulo"
        className="mt-4 border-t border-border px-5 py-6"
      >
        <h2 id="novo-item-titulo" className="mb-4 text-sm font-medium">
          Adicionar novo relógio
        </h2>
        <NewItemForm onCreated={prepend} />
      </section>
    </>
  );
}
