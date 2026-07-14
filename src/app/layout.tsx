import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Jogo de flashcards com baralhos por nível de dificuldade",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background text-white">{children}</body>
    </html>
  );
}
