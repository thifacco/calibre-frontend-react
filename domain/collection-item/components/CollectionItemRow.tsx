import { ChevronDownIcon } from "lucide-react";
import { MOVEMENT_LABELS } from "../types";
import type { FeedItem } from "@/domain/shared/types";

/**
 * Uma peça da coleção. O chevron do wireframe é um `<details>`/`<summary>`
 * nativo: abre por clique, por Enter e por Espaço, expõe `aria-expanded`
 * sozinho e funciona com JavaScript desligado. Um `<div onClick>` com estado
 * daria o mesmo visual e nada disso.
 *
 * Server Component — não tem estado nem evento.
 */
export function CollectionItemRow({ item }: { item: FeedItem }) {
  const detalhes: Array<{ rotulo: string; valor: string }> = [
    ...(item.referenceNumber !== undefined
      ? [{ rotulo: "Referência", valor: item.referenceNumber }]
      : []),
    ...(item.movementType !== undefined
      ? [{ rotulo: "Movimento", valor: MOVEMENT_LABELS[item.movementType] }]
      : []),
    ...(item.acquiredYear !== undefined
      ? [{ rotulo: "Ano de aquisição", valor: String(item.acquiredYear) }]
      : []),
    ...(item.acquiredContext !== undefined
      ? [{ rotulo: "Como chegou", valor: item.acquiredContext }]
      : []),
  ];

  return (
    <details
      data-testid="item-colecao"
      data-item-id={item.id}
      className="group mb-2 rounded-lg bg-card px-3.5 py-3"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">
            {item.brand} {item.model}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {item.memoryStory}
          </span>
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="mt-3 border-t border-border pt-3">
        <p className="text-sm leading-relaxed text-foreground">{item.memoryStory}</p>

        {detalhes.length > 0 && (
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            {detalhes.map((detalhe) => (
              <div key={detalhe.rotulo} className="contents">
                <dt className="text-muted-foreground">{detalhe.rotulo}</dt>
                <dd className="text-foreground">{detalhe.valor}</dd>
              </div>
            ))}
          </dl>
        )}

        {item.photos.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {item.photos.map((foto) => (
              <li key={foto}>
                <a
                  href={foto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2"
                >
                  Ver foto
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          {item.reactionCounts.touched + item.reactionCounts.curious + item.reactionCounts.sameStory}{" "}
          reações · {item.commentCount} comentários
        </p>
      </div>
    </details>
  );
}
