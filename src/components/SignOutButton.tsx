"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
    >
      Sair
    </button>
  );
}
