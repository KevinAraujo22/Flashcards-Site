import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDecks, seedUsers } from "@/lib/seedData";

export async function POST(req: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SEED_SECRET não configurado." }, { status: 500 });
  }

  if (req.headers.get("x-seed-secret") !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";

  const existingUsers = await prisma.user.count();
  if (existingUsers > 0 && !force) {
    return NextResponse.json(
      {
        error: "Já existem usuários no banco. Chame com ?force=1 se quiser gerar novas senhas para todos.",
      },
      { status: 409 }
    );
  }

  await seedDecks(prisma);
  const credentials = await seedUsers(prisma);

  return NextResponse.json({ credentials });
}
