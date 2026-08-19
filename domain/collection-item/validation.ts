import type { FieldErrors, MovementType, NewCollectionItemInput } from "@/domain/shared/types";
import { LIMITES, MOVEMENT_ORDER, type NewItemFormValues } from "./types";

/**
 * Validação e conversão do formulário de novo item. Funções puras — sem React,
 * sem HTTP. As regras espelham o `newItemSchema` do back-end e servem para dar
 * resposta imediata, não para substituir a validação de lá.
 */

export const VALORES_INICIAIS: NewItemFormValues = {
  brand: "",
  model: "",
  referenceNumber: "",
  movementType: "",
  acquiredYear: "",
  acquiredContext: "",
  photos: "",
  memoryStory: "",
};

function anoMaximo(): number {
  return new Date().getFullYear();
}

function ehUrlValida(valor: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateNewItem(values: NewItemFormValues): FieldErrors<NewItemFormValues> {
  const errors: FieldErrors<NewItemFormValues> = {};

  const brand = values.brand.trim();
  const model = values.model.trim();
  const memoryStory = values.memoryStory.trim();

  if (brand === "") errors.brand = "Informe a marca.";
  else if (brand.length > LIMITES.brand) errors.brand = `Máximo de ${LIMITES.brand} caracteres.`;

  if (model === "") errors.model = "Informe o modelo.";
  else if (model.length > LIMITES.model) errors.model = `Máximo de ${LIMITES.model} caracteres.`;

  if (memoryStory === "") {
    errors.memoryStory = "A história é o que dá sentido à peça. Conte a sua.";
  } else if (memoryStory.length > LIMITES.memoryStory) {
    errors.memoryStory = `Máximo de ${LIMITES.memoryStory} caracteres.`;
  }

  if (values.referenceNumber.trim().length > LIMITES.referenceNumber) {
    errors.referenceNumber = `Máximo de ${LIMITES.referenceNumber} caracteres.`;
  }

  if (values.acquiredContext.trim().length > LIMITES.acquiredContext) {
    errors.acquiredContext = `Máximo de ${LIMITES.acquiredContext} caracteres.`;
  }

  if (values.movementType !== "" && !MOVEMENT_ORDER.includes(values.movementType as MovementType)) {
    errors.movementType = "Selecione um tipo válido.";
  }

  const ano = values.acquiredYear.trim();
  if (ano !== "") {
    const numero = Number(ano);
    if (!Number.isInteger(numero) || numero < LIMITES.anoMinimo || numero > anoMaximo()) {
      errors.acquiredYear = `Informe um ano entre ${LIMITES.anoMinimo} e ${anoMaximo()}.`;
    }
  }

  const foto = values.photos.trim();
  if (foto !== "" && !ehUrlValida(foto)) {
    errors.photos = "Informe uma URL de imagem começando com http:// ou https://.";
  }

  return errors;
}

/**
 * Converte o formulário no payload do contrato.
 *
 * Campo opcional vazio é **omitido**, não enviado como string vazia: o zod do
 * back-end rejeitaria `""` em `referenceNumber` por causa do `.trim().max()`
 * ser aplicado sobre algo que ele espera ausente, e `acquiredYear` precisa ser
 * número, não texto.
 */
export function toNewItemInput(values: NewItemFormValues): NewCollectionItemInput {
  const referenceNumber = values.referenceNumber.trim();
  const acquiredContext = values.acquiredContext.trim();
  const acquiredYear = values.acquiredYear.trim();
  const foto = values.photos.trim();

  return {
    brand: values.brand.trim(),
    model: values.model.trim(),
    memoryStory: values.memoryStory.trim(),
    ...(referenceNumber !== "" ? { referenceNumber } : {}),
    ...(values.movementType !== ""
      ? { movementType: values.movementType as MovementType }
      : {}),
    ...(acquiredYear !== "" ? { acquiredYear: Number(acquiredYear) } : {}),
    ...(acquiredContext !== "" ? { acquiredContext } : {}),
    ...(foto !== "" ? { photos: [foto] } : {}),
  };
}
