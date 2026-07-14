import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export function Header({ userName }: { userName: string }) {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          Flashcards
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">{userName}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
