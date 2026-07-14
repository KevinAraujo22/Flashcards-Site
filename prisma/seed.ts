import { PrismaClient, Difficulty } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { writeFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generatePassword(length = 10): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARSET[bytes[i] % CHARSET.length];
  }
  return out;
}

type DeckSeed = {
  slug: string;
  title: string;
  description: string;
  cards: { question: string; answer: string; difficulty: Difficulty }[];
};

const decks: DeckSeed[] = [
  {
    slug: "geografia-brasil",
    title: "Geografia do Brasil",
    description: "Baralho de exemplo sobre geografia do Brasil.",
    cards: [
      { question: "Qual é a capital do Brasil?", answer: "Brasília", difficulty: "MUITO_FACIL" },
      { question: "Qual oceano banha o litoral brasileiro?", answer: "Oceano Atlântico", difficulty: "MUITO_FACIL" },
      { question: "Quantos estados tem o Brasil (sem contar o DF)?", answer: "26 estados", difficulty: "FACIL" },
      { question: "Qual é o maior estado brasileiro em área?", answer: "Amazonas", difficulty: "FACIL" },
      { question: "Qual é o rio mais extenso do Brasil?", answer: "Rio Amazonas", difficulty: "FACIL" },
      { question: "Qual região concentra a maior parte da Floresta Amazônica?", answer: "Região Norte", difficulty: "MEDIO" },
      { question: "Qual é a moeda oficial do Brasil?", answer: "Real (BRL)", difficulty: "MEDIO" },
      { question: "Em quantas regiões oficiais o IBGE divide o Brasil?", answer: "5 regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul", difficulty: "MEDIO" },
      { question: "Qual é o ponto mais alto do Brasil?", answer: "Pico da Neblina", difficulty: "DIFICIL" },
      { question: "Qual estado brasileiro faz fronteira com o maior número de outros estados?", answer: "Bahia (faz fronteira com 8 estados)", difficulty: "DIFICIL" },
      { question: "Qual estado é banhado pelo Atlântico e faz fronteira com o Uruguai?", answer: "Rio Grande do Sul", difficulty: "MUITO_DIFICIL" },
      { question: "Qual linha imaginária corta o Brasil próximo a Macapá?", answer: "Linha do Equador", difficulty: "MUITO_DIFICIL" },
    ],
  },
  {
    slug: "matematica-basica",
    title: "Matemática Básica",
    description: "Baralho de exemplo com operações e conceitos matemáticos.",
    cards: [
      { question: "Quanto é 7 + 5?", answer: "12", difficulty: "MUITO_FACIL" },
      { question: "Quanto é 9 x 3?", answer: "27", difficulty: "MUITO_FACIL" },
      { question: "Quanto é 144 dividido por 12?", answer: "12", difficulty: "FACIL" },
      { question: "Qual é a área de um quadrado de lado 5?", answer: "25", difficulty: "FACIL" },
      { question: "Quanto é 15% de 200?", answer: "30", difficulty: "FACIL" },
      { question: "Qual é o valor de x em 2x + 3 = 11?", answer: "x = 4", difficulty: "MEDIO" },
      { question: "Quanto é a raiz quadrada de 169?", answer: "13", difficulty: "MEDIO" },
      { question: "Qual o resultado de (3 + 4) x 2 - 5?", answer: "9", difficulty: "MEDIO" },
      { question: "Qual é a soma dos ângulos internos de um triângulo?", answer: "180 graus", difficulty: "DIFICIL" },
      { question: "Quanto é 2 elevado a 10?", answer: "1024", difficulty: "DIFICIL" },
      { question: "Qual é a derivada de x² em relação a x?", answer: "2x", difficulty: "MUITO_DIFICIL" },
      { question: "Qual o valor aproximado de π (pi) com duas casas decimais?", answer: "3,14", difficulty: "MUITO_DIFICIL" },
    ],
  },
  {
    slug: "vocabulario-ingles",
    title: "Vocabulário em Inglês",
    description: "Baralho de exemplo com vocabulário e expressões em inglês.",
    cards: [
      { question: 'Como se diz "casa" em inglês?', answer: "House", difficulty: "MUITO_FACIL" },
      { question: 'Como se diz "cachorro" em inglês?', answer: "Dog", difficulty: "MUITO_FACIL" },
      { question: 'Como se diz "obrigado" em inglês?', answer: "Thank you", difficulty: "FACIL" },
      { question: 'Qual o significado da palavra "book"?', answer: "Livro", difficulty: "FACIL" },
      { question: 'Como se diz "eu gosto de você" em inglês?', answer: "I like you", difficulty: "FACIL" },
      { question: 'Qual o significado da palavra "although"?', answer: "Embora / apesar de", difficulty: "MEDIO" },
      { question: 'Como se diz "eu tenho trabalhado muito" em inglês?', answer: "I have been working a lot", difficulty: "MEDIO" },
      { question: 'Qual o significado de "nevertheless"?', answer: "No entanto / mesmo assim", difficulty: "MEDIO" },
      { question: 'Qual a diferença entre "make" e "do"?', answer: '"Make" é usado para criar/produzir algo; "do" para realizar tarefas', difficulty: "DIFICIL" },
      { question: 'O que significa a expressão "break the ice"?', answer: "Quebrar o gelo, iniciar uma conversa em situação tensa", difficulty: "DIFICIL" },
      { question: 'O que significa "to bite the bullet"?', answer: 'Encarar uma situação difícil com coragem ("engolir o sapo")', difficulty: "MUITO_DIFICIL" },
      { question: 'Qual a diferença de uso entre "affect" e "effect"?', answer: '"Affect" é verbo (afetar); "effect" é substantivo (efeito)', difficulty: "MUITO_DIFICIL" },
    ],
  },
];

async function main() {
  for (const deck of decks) {
    const createdDeck = await prisma.deck.upsert({
      where: { slug: deck.slug },
      update: { title: deck.title, description: deck.description },
      create: { slug: deck.slug, title: deck.title, description: deck.description },
    });

    await prisma.card.deleteMany({ where: { deckId: createdDeck.id } });
    await prisma.card.createMany({
      data: deck.cards.map((card, index) => ({
        deckId: createdDeck.id,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        order: index,
      })),
    });

    console.log(`Baralho pronto: ${deck.title} (${deck.cards.length} cartas)`);
  }

  const credentialLines: string[] = [
    "Credenciais geradas em " + new Date().toISOString(),
    "usuario;senha",
  ];

  for (let i = 1; i <= 10; i++) {
    const username = `usuario${i}`;
    const plainPassword = generatePassword();
    const hashed = await bcrypt.hash(plainPassword, 10);

    await prisma.user.upsert({
      where: { username },
      update: { password: hashed },
      create: {
        username,
        password: hashed,
        name: `Usuário ${i}`,
      },
    });

    credentialLines.push(`${username};${plainPassword}`);
  }

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
