/**
 * Landing. Página fina: só compõe — nenhuma regra de negócio aqui.
 *
 * O campo de busca e o feed com rolagem infinita entram junto com o domínio
 * `feed`, abaixo do slogan.
 */
export default function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 pt-10 pb-6 text-center">
      <h1 className="mx-auto max-w-[30rem] text-2xl leading-relaxed font-normal text-balance">
        Toda coleção guarda uma conversa que ainda não aconteceu.
      </h1>
    </div>
  );
}
