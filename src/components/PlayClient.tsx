"use client";

import { useState } from "react";
import Link from "next/link";
import type { Difficulty } from "@prisma/client";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "@/lib/difficulty";

type Card = {
  id: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
};

type SubmitResult = {
  attemptPercentage: number;
  savedPercentage: number;
  improved: boolean;
  isFirstAttempt: boolean;
  canImproveNow: boolean;
  nextEligibleAt: string;
};

export function PlayClient({
  deckId,
  deckTitle,
  cards,
}: {
  deckId: string;
  deckTitle: string;
  cards: Card[];
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = cards.length;
  const current = cards[index];

  function answer(correct: boolean) {
    const newCorrectCount = correct ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrectCount);
    setRevealed(false);

    if (index + 1 >= total) {
      submitScore(newCorrectCount);
    } else {
      setIndex(index + 1);
    }
  }

  async function submitScore(finalCorrectCount: number) {
    setFinished(true);
    setSubmitting(true);
    setError(null);

    const percentage = Math.round((finalCorrectCount / total) * 100);

    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId, percentage }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Falha ao salvar pontuação.");
      }

      const data: SubmitResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  function playAgain() {
    setIndex(0);
    setRevealed(false);
    setCorrectCount(0);
    setFinished(false);
    setResult(null);
    setError(null);
  }

  if (finished) {
    const attemptPercentage = Math.round((correctCount / total) * 100);

    return (
      <div className="rounded-2xl border border-white/10 bg-surface p-6">
        <h1 className="mb-1 text-xl font-bold">{deckTitle}</h1>
        <p className="mb-4 text-sm text-white/60">Resultado da partida</p>

        <div className="mb-6 text-center">
          <div className="text-4xl font-bold text-primary">{attemptPercentage}%</div>
          <p className="mt-1 text-sm text-white/60">
            {correctCount} de {total} cartas corretas
          </p>
        </div>

        {submitting && <p className="text-sm text-white/60">Salvando resultado...</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {result && (
          <div className="mb-6 rounded-lg border border-white/10 bg-black/20 p-4 text-sm">
            <p className="mb-1">
              Pontuação salva do baralho:{" "}
              <span className="font-semibold">{result.savedPercentage}%</span>
            </p>
            {result.isFirstAttempt && <p className="text-white/60">Primeira vez jogando — pontuação salva.</p>}
            {!result.isFirstAttempt && result.improved && (
              <p className="text-emerald-400">Você melhorou sua pontuação salva!</p>
            )}
            {!result.isFirstAttempt && !result.improved && result.canImproveNow && (
              <p className="text-white/60">
                Essa tentativa não superou a pontuação salva, então ela não foi alterada.
              </p>
            )}
            {!result.isFirstAttempt && !result.canImproveNow && (
              <p className="text-white/60">
                A pontuação só pode melhorar a cada 15 dias. Próxima chance:{" "}
                {new Date(result.nextEligibleAt).toLocaleDateString("pt-BR")}.
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={playAgain}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/30"
          >
            Jogar novamente
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{deckTitle}</h1>
        <span className="text-sm text-white/50">
          {index + 1} / {total}
        </span>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface p-6">
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${DIFFICULTY_COLORS[current.difficulty]}`}
        >
          {DIFFICULTY_LABELS[current.difficulty]}
        </span>

        <p className="mt-4 text-lg font-medium">{current.question}</p>

        {revealed ? (
          <div className="mt-4">
            <p className="rounded-lg bg-black/30 p-4 text-white/90">{current.answer}</p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => answer(false)}
                className="flex-1 rounded-lg border border-red-500/40 bg-red-500/10 py-2 font-medium text-red-300 transition hover:bg-red-500/20"
              >
                Errei
              </button>
              <button
                onClick={() => answer(true)}
                className="flex-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 py-2 font-medium text-emerald-300 transition hover:bg-emerald-500/20"
              >
                Acertei
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="mt-5 w-full rounded-lg bg-primary py-2 font-medium text-white transition hover:opacity-90"
          >
            Mostrar resposta
          </button>
        )}
      </div>
    </div>
  );
}
