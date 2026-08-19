/**
 * Vazio tem dois motivos, e dizer qual é evita que o usuário ache que o feed
 * quebrou: ou a busca não achou nada, ou o clube ainda não tem histórias.
 */
export function FeedEmpty({ query }: { query: string }) {
  const buscando = query !== "";

  return (
    <p
      data-testid="feed-vazio"
      className="border-t border-border px-5 py-10 text-center text-sm text-muted-foreground"
    >
      {buscando ? (
        <>
          Nenhuma história menciona <span className="text-foreground">{query}</span>.
        </>
      ) : (
        "Ainda não há histórias por aqui. A primeira pode ser a sua."
      )}
    </p>
  );
}
