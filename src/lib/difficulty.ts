import { Difficulty } from "@prisma/client";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  MUITO_FACIL: "Muito Fácil",
  FACIL: "Fácil",
  MEDIO: "Médio",
  DIFICIL: "Difícil",
  MUITO_DIFICIL: "Muito Difícil",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  MUITO_FACIL: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  FACIL: "bg-lime-500/20 text-lime-300 border-lime-500/30",
  MEDIO: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  DIFICIL: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  MUITO_DIFICIL: "bg-red-500/20 text-red-300 border-red-500/30",
};
