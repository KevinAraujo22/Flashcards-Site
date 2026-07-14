import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import path from "path";
import { decks, seedDecks, seedUsers } from "../src/lib/seedData";

const prisma = new PrismaClient();

async function main() {
  await seedDecks(prisma);
  for (const deck of decks) {
    console.log(`Baralho pronto: ${deck.title} (${deck.cards.length} cartas)`);
  }

  const credentials = await seedUsers(prisma);

  const credentialLines = [
    "Credenciais geradas em " + new Date().toISOString(),
    "usuario;senha",
    ...credentials.map((c) => `${c.username};${c.password}`),
  ];

  const outPath = path.join(process.cwd(), "credentials.txt");
  writeFileSync(outPath, credentialLines.join("\n") + "\n", "utf-8");

  console.log("\n10 usuários criados/atualizados.");
  console.log(`Senhas em texto puro salvas em: ${outPath}`);
  console.log("Esse arquivo NÃO é versionado (está no .gitignore). Guarde-o com cuidado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
