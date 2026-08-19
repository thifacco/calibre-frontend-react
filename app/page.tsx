import { Feed } from "@/domain/feed/components/Feed";

/**
 * Landing. Página fina: só compõe — nenhuma regra de negócio, nenhum estado.
 * O feed é público, não exige sessão para ser lido.
 */
export default function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="px-6 pt-10 pb-6 text-center">
        <h1 className="mx-auto max-w-[30rem] text-2xl leading-relaxed font-normal text-balance">
          Toda coleção guarda uma conversa que ainda não aconteceu.
        </h1>
      </div>

      <Feed />
    </div>
  );
}
