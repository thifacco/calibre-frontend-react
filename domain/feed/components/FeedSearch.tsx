"use client";

import { useCallback, type ChangeEvent } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Campo de busca do feed. Filtra por marca/modelo sem navegar de página — o
 * `q` vai para `GET /api/feed`.
 *
 * O componente é burro de propósito: recebe valor e callback, não conhece
 * debounce nem endpoint. Quem segura isso é o useFeed.
 */

export interface FeedSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function FeedSearch({ value, onChange }: FeedSearchProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
    [onChange],
  );

  return (
    // `search` como role nativo: dá ao agente e ao leitor de tela um landmark
    // para achar a busca sem depender de texto.
    <search className="mx-auto w-full max-w-[26rem]">
      {/* O rótulo é visualmente oculto porque o placeholder já orienta quem
          enxerga — mas o campo continua rotulado no DOM. */}
      <Label htmlFor="feed-busca" className="sr-only">
        Buscar um modelo de relógio
      </Label>
      <div className="relative">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="feed-busca"
          name="q"
          type="search"
          autoComplete="off"
          placeholder="Buscar um modelo de relógio"
          value={value}
          onChange={handleChange}
          className="pl-9"
          data-testid="campo-busca"
        />
      </div>
    </search>
  );
}
