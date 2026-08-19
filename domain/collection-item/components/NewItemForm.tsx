"use client";

import { useCallback, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateItem } from "../hooks/useCreateItem";
import { LIMITES, MOVEMENT_LABELS, MOVEMENT_ORDER, type NewItemFormValues } from "../types";
import type { FeedItem } from "@/domain/shared/types";

/**
 * Formulário de novo relógio. Todos os campos do brief, com os `id` literais
 * da tabela do ARQUITETURA.md.
 *
 * O tipo de movimento usa `<select>` **nativo**, não o Select do shadcn. O do
 * shadcn é um combobox do Radix — um botão que abre uma listbox em portal.
 * Acessível, porém muito mais difícil de operar por DOM do que um `<select>`,
 * e o requisito AI-first pesa mais aqui que a consistência visual.
 *
 * A foto é uma URL, não upload: o back-end valida `photos` como array de URLs
 * e não existe endpoint de upload nem storage. A drop zone do wireframe volta
 * quando o contrato tiver upload.
 */

const CLASSE_ERRO = "mt-1.5 text-xs text-destructive";

export function NewItemForm({ onCreated }: { onCreated: (item: FeedItem) => void }) {
  const { values, setField, submit, submitting, fieldErrors, formError, justCreated } =
    useCreateItem(onCreated);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setField(event.target.name as keyof NewItemFormValues, event.target.value);
    },
    [setField],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submit();
    },
    [submit],
  );

  const anoMaximo = new Date().getFullYear();

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="novo-item-titulo">
      {formError !== null && (
        <p
          role="alert"
          data-testid="erro-novo-item"
          className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground"
        >
          {formError}
        </p>
      )}

      {justCreated && (
        <p
          role="status"
          data-testid="item-adicionado"
          className="mb-4 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground"
        >
          Relógio adicionado à sua coleção.
        </p>
      )}

      <div className="mb-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="item-marca" className="mb-1.5 text-muted-foreground">
            Marca
          </Label>
          <Input
            id="item-marca"
            name="brand"
            type="text"
            maxLength={LIMITES.brand}
            placeholder="Ex: Hamilton"
            value={values.brand}
            onChange={handleChange}
            aria-invalid={fieldErrors.brand !== undefined}
            aria-describedby={fieldErrors.brand !== undefined ? "item-marca-erro" : undefined}
          />
          {fieldErrors.brand !== undefined && (
            <p id="item-marca-erro" role="alert" className={CLASSE_ERRO}>
              {fieldErrors.brand}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="item-modelo" className="mb-1.5 text-muted-foreground">
            Modelo
          </Label>
          <Input
            id="item-modelo"
            name="model"
            type="text"
            maxLength={LIMITES.model}
            placeholder="Ex: Khaki Field"
            value={values.model}
            onChange={handleChange}
            aria-invalid={fieldErrors.model !== undefined}
            aria-describedby={fieldErrors.model !== undefined ? "item-modelo-erro" : undefined}
          />
          {fieldErrors.model !== undefined && (
            <p id="item-modelo-erro" role="alert" className={CLASSE_ERRO}>
              {fieldErrors.model}
            </p>
          )}
        </div>
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="item-referencia" className="mb-1.5 text-muted-foreground">
            Referência <span className="text-xs">(opcional)</span>
          </Label>
          <Input
            id="item-referencia"
            name="referenceNumber"
            type="text"
            maxLength={LIMITES.referenceNumber}
            placeholder="Ex: H70455133"
            value={values.referenceNumber}
            onChange={handleChange}
            aria-invalid={fieldErrors.referenceNumber !== undefined}
            aria-describedby={
              fieldErrors.referenceNumber !== undefined ? "item-referencia-erro" : undefined
            }
          />
          {fieldErrors.referenceNumber !== undefined && (
            <p id="item-referencia-erro" role="alert" className={CLASSE_ERRO}>
              {fieldErrors.referenceNumber}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="item-movimento" className="mb-1.5 text-muted-foreground">
            Movimento <span className="text-xs">(opcional)</span>
          </Label>
          <select
            id="item-movimento"
            name="movementType"
            value={values.movementType}
            onChange={handleChange}
            aria-invalid={fieldErrors.movementType !== undefined}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="">Não informado</option>
            {MOVEMENT_ORDER.map((tipo) => (
              <option key={tipo} value={tipo}>
                {MOVEMENT_LABELS[tipo]}
              </option>
            ))}
          </select>
          {fieldErrors.movementType !== undefined && (
            <p role="alert" className={CLASSE_ERRO}>
              {fieldErrors.movementType}
            </p>
          )}
        </div>
      </div>

      <div className="mb-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="item-ano" className="mb-1.5 text-muted-foreground">
            Ano de aquisição <span className="text-xs">(opcional)</span>
          </Label>
          <Input
            id="item-ano"
            name="acquiredYear"
            type="number"
            inputMode="numeric"
            min={LIMITES.anoMinimo}
            max={anoMaximo}
            placeholder={String(anoMaximo)}
            value={values.acquiredYear}
            onChange={handleChange}
            aria-invalid={fieldErrors.acquiredYear !== undefined}
            aria-describedby={fieldErrors.acquiredYear !== undefined ? "item-ano-erro" : undefined}
          />
          {fieldErrors.acquiredYear !== undefined && (
            <p id="item-ano-erro" role="alert" className={CLASSE_ERRO}>
              {fieldErrors.acquiredYear}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="item-fotos" className="mb-1.5 text-muted-foreground">
            Foto <span className="text-xs">(opcional, URL)</span>
          </Label>
          <Input
            id="item-fotos"
            name="photos"
            type="url"
            placeholder="https://..."
            value={values.photos}
            onChange={handleChange}
            aria-invalid={fieldErrors.photos !== undefined}
            aria-describedby={fieldErrors.photos !== undefined ? "item-fotos-erro" : undefined}
          />
          {fieldErrors.photos !== undefined && (
            <p id="item-fotos-erro" role="alert" className={CLASSE_ERRO}>
              {fieldErrors.photos}
            </p>
          )}
        </div>
      </div>

      <div className="mb-3.5">
        <Label htmlFor="item-contexto" className="mb-1.5 text-muted-foreground">
          Como o relógio chegou até você <span className="text-xs">(opcional)</span>
        </Label>
        <Input
          id="item-contexto"
          name="acquiredContext"
          type="text"
          maxLength={LIMITES.acquiredContext}
          placeholder="Ex: presente de formatura"
          value={values.acquiredContext}
          onChange={handleChange}
          aria-invalid={fieldErrors.acquiredContext !== undefined}
          aria-describedby={
            fieldErrors.acquiredContext !== undefined ? "item-contexto-erro" : undefined
          }
        />
        {fieldErrors.acquiredContext !== undefined && (
          <p id="item-contexto-erro" role="alert" className={CLASSE_ERRO}>
            {fieldErrors.acquiredContext}
          </p>
        )}
      </div>

      <div className="mb-5">
        <Label htmlFor="item-memoria" className="mb-1.5 text-muted-foreground">
          História / memória emocional
        </Label>
        <Textarea
          id="item-memoria"
          name="memoryStory"
          rows={3}
          maxLength={LIMITES.memoryStory}
          placeholder="Conte a história por trás deste relógio"
          value={values.memoryStory}
          onChange={handleChange}
          aria-invalid={fieldErrors.memoryStory !== undefined}
          aria-describedby={
            fieldErrors.memoryStory !== undefined ? "item-memoria-erro" : undefined
          }
        />
        {fieldErrors.memoryStory !== undefined && (
          <p id="item-memoria-erro" role="alert" className={CLASSE_ERRO}>
            {fieldErrors.memoryStory}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={submitting}
        data-testid="botao-adicionar-item"
      >
        {submitting ? "Adicionando..." : "Adicionar à coleção"}
      </Button>
    </form>
  );
}
