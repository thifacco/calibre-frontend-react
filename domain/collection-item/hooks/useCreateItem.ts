"use client";

import { useCallback, useState } from "react";
import * as collectionItemService from "../services/collectionItemService";
import { useSession } from "@/domain/auth/hooks/useSession";
import { isApiError } from "@/domain/shared/services/ApiError";
import { toNewItemInput, validateNewItem, VALORES_INICIAIS } from "../validation";
import type { NewItemFormValues } from "../types";
import type { FeedItem, FieldErrors } from "@/domain/shared/types";

/**
 * Criação de item de coleção.
 *
 * O hook é dono dos valores do formulário — mesmo motivo do `useComment`:
 * assim ele limpa os campos no callback de sucesso, sem `useEffect` reagindo a
 * um flag, que é o padrão reprovado pelo React 19.
 */

const CAMPOS_DO_BACKEND = [
  "brand",
  "model",
  "referenceNumber",
  "movementType",
  "acquiredYear",
  "acquiredContext",
  "photos",
  "memoryStory",
] as const;

export interface UseCreateItemResult {
  values: NewItemFormValues;
  setField: (name: keyof NewItemFormValues, value: string) => void;
  submit: () => void;
  submitting: boolean;
  fieldErrors: FieldErrors<NewItemFormValues>;
  formError: string | null;
  justCreated: boolean;
}

export function useCreateItem(onCreated: (item: FeedItem) => void): UseCreateItemResult {
  const { token, handleUnauthorized } = useSession();

  const [values, setValues] = useState<NewItemFormValues>(VALORES_INICIAIS);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<NewItemFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);

  const setField = useCallback((name: keyof NewItemFormValues, value: string) => {
    setValues((atual) => ({ ...atual, [name]: value }));
    setJustCreated(false);
  }, []);

  const submit = useCallback(() => {
    if (token === null) return;

    const erros = validateNewItem(values);
    if (Object.keys(erros).length > 0) {
      setFieldErrors(erros);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setJustCreated(false);
    setSubmitting(true);

    void collectionItemService
      .create(toNewItemInput(values), token)
      .then((item) => {
        setValues(VALORES_INICIAIS);
        setJustCreated(true);
        onCreated(item);
      })
      .catch((erro: unknown) => {
        if (handleUnauthorized(erro)) return;

        // 400 com `details`: cada `field` casa com o `name` do input.
        if (isApiError(erro) && erro.status === 400 && erro.details !== undefined) {
          const doCampo: FieldErrors<NewItemFormValues> = {};
          const semDono: string[] = [];

          for (const detalhe of erro.details) {
            // O `field` é o caminho do zod, e em array vem indexado
            // ("photos.0"). O formulário tem um campo só por caminho-raiz.
            const raiz = detalhe.field.split(".")[0] ?? detalhe.field;

            if ((CAMPOS_DO_BACKEND as readonly string[]).includes(raiz)) {
              doCampo[raiz as keyof NewItemFormValues] = detalhe.message;
            } else {
              semDono.push(`${detalhe.field}: ${detalhe.message}`);
            }
          }

          setFieldErrors(doCampo);
          setFormError(semDono.length > 0 ? semDono.join(" ") : null);
          return;
        }

        setFormError(
          isApiError(erro) ? erro.message : "Não foi possível adicionar o relógio.",
        );
      })
      .finally(() => setSubmitting(false));
  }, [values, token, onCreated, handleUnauthorized]);

  return { values, setField, submit, submitting, fieldErrors, formError, justCreated };
}
