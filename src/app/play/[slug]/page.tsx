import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { PlayClient } from "@/components/PlayClient";

export default async function PlayPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const deck = await prisma.deck.findUnique({
    where: { slug: params.slug },
    include: { cards: { orderBy: { order: "asc" } } },
  });

  if (!deck) notFound();

  const userName = session.user.name ?? "Jogador";

  return (
    <div>
      <Header userName={userName} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <PlayClient
          deckId={deck.id}
          deckTitle={deck.title}
          cards={deck.cards.map((c) => ({
            id: c.id,
            question: c.question,
            answer: c.answer,
            difficulty: c.difficulty,
          }))}
        />
      </main>
    </div>
  );
}
