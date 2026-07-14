import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { canImproveNow, daysRemaining } from "@/lib/cooldown";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const userName = session.user.name ?? "Jogador";

  const [decks, scores] = await Promise.all([
    prisma.deck.findMany({
      orderBy: { title: "asc" },
      include: { _count: { select: { cards: true } } },
    }),
    prisma.score.findMany({ where: { userId } }),
  ]);

  const scoreByDeck = new Map(scores.map((s) => [s.deckId, s]));

  return (
    <div>
      <Header userName={userName} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold">Baralhos</h1>
        <p className="mb-6 text-sm text-white/60">
          Escolha um baralho para jogar. A porcentagem salva só pode melhorar a cada 15 dias.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {decks.map((deck) => {
            const score = scoreByDeck.get(deck.id);
            const canImprove = score ? canImproveNow(score.lastUpdatedAt) : true;
            const remaining = score ? daysRemaining(score.lastUpdatedAt) : 0;

            return (
              <div
                key={deck.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-surface p-5"
              >
                <div>
                  <h2 className="text-lg font-semibold">{deck.title}</h2>
                  {deck.description && (
                    <p className="mt-1 text-sm text-white/60">{deck.description}</p>
                  )}
                  <p className="mt-1 text-xs text-white/40">{deck._count.cards} cartas</p>

                  <div className="mt-4">
                    {score ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/30">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${score.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{score.percentage}%</span>
                        </div>
                        <p className="text-xs text-white/50">
                          {canImprove
                            ? "Você já pode melhorar essa pontuação."
                            : `Poderá melhorar em ${remaining} dia${remaining === 1 ? "" : "s"}.`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-white/50">Ainda não jogado.</p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/play/${deck.slug}`}
                  className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-90"
                >
                  Jogar
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
