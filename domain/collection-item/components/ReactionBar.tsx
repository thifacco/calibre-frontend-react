"use client";

import { useCallback } from "react";
import { CircleHelpIcon, HeartIcon, RepeatIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReaction } from "../hooks/useReaction";
import { REACTION_LABELS, REACTION_ORDER, REACTION_TESTIDS } from "../types";
import type { ReactionCounts, ReactionType } from "@/domain/shared/types";

/**
 * As três reações de um item, com o contador ao lado.
 *
 * Cada botão é um `<button>` de verdade com `aria-label` descritivo — o ícone
 * sozinho não diz nada a leitor de tela nem a agente, e o número ao lado é
 * ambíguo sem o rótulo.
 */

const ICONES: Record<ReactionType, typeof HeartIcon> = {
  TOUCHED: HeartIcon,
  CURIOUS: CircleHelpIcon,
  SAME_STORY: RepeatIcon,
};

function contadorDe(counts: ReactionCounts, type: ReactionType): number {
  if (type === "TOUCHED") return counts.touched;
  if (type === "CURIOUS") return counts.curious;
  return counts.sameStory;
}

export interface ReactionBarProps {
  itemId: string;
  counts: ReactionCounts;
  onCounts: (counts: ReactionCounts) => void;
}

export function ReactionBar({ itemId, counts, onCounts }: ReactionBarProps) {
  const { react, pending, reacted, error } = useReaction(itemId, onCounts);

  const handleClick = useCallback(
    (type: ReactionType) => () => react(type),
    [react],
  );

  return (
    <div className="flex items-center gap-3">
      {REACTION_ORDER.map((type) => {
        const Icone = ICONES[type];
        const jaReagiu = reacted.has(type);
        const total = contadorDe(counts, type);

        return (
          <button
            key={type}
            type="button"
            onClick={handleClick(type)}
            disabled={pending !== null}
            // O rótulo carrega o total para o agente ler botão e número juntos,
            // sem ter que costurar dois nós do DOM.
            aria-label={`${REACTION_LABELS[type]} (${total})`}
            aria-pressed={jaReagiu}
            data-testid={REACTION_TESTIDS[type]}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[0.8125rem] transition-colors",
              "hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              "disabled:opacity-50",
              jaReagiu ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icone aria-hidden="true" className="size-4" />
            {total}
          </button>
        );
      })}

      {error !== null && (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
