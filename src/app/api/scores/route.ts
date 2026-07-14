import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canImproveNow, nextEligibleDate } from "@/lib/cooldown";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json().catch(() => null);

  const deckId = body?.deckId;
  const percentage = Number(body?.percentage);

  if (
    typeof deckId !== "string" ||
    !Number.isFinite(percentage) ||
    percentage < 0 ||
    percentage > 100
  ) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const deck = await prisma.deck.findUnique({ where: { id: deckId } });
  if (!deck) {
    return NextResponse.json({ error: "Baralho não encontrado." }, { status: 404 });
  }

  const roundedPercentage = Math.round(percentage);
  const now = new Date();

  const existing = await prisma.score.findUnique({
    where: { userId_deckId: { userId, deckId } },
  });

  if (!existing) {
    const created = await prisma.score.create({
      data: {
        userId,
        deckId,
        percentage: roundedPercentage,
        attempts: 1,
        lastPlayedAt: now,
        lastUpdatedAt: now,
      },
    });

    return NextResponse.json({
      attemptPercentage: roundedPercentage,
      savedPercentage: created.percentage,
      improved: true,
      isFirstAttempt: true,
      canImproveNow: false,
      nextEligibleAt: nextEligibleDate(now).toISOString(),
    });
  }

  const eligible = canImproveNow(existing.lastUpdatedAt, now);
  const willImprove = eligible && roundedPercentage > existing.percentage;

  const updated = await prisma.score.update({
    where: { userId_deckId: { userId, deckId } },
    data: {
      attempts: { increment: 1 },
      lastPlayedAt: now,
      ...(willImprove
        ? { percentage: roundedPercentage, lastUpdatedAt: now }
        : {}),
    },
  });

  return NextResponse.json({
    attemptPercentage: roundedPercentage,
    savedPercentage: updated.percentage,
    improved: willImprove,
    isFirstAttempt: false,
    canImproveNow: eligible,
    nextEligibleAt: nextEligibleDate(updated.lastUpdatedAt).toISOString(),
  });
}
