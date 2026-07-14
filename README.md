# Flashcards

Jogo de flashcards com 3 baralhos de 12 cartas cada, níveis de dificuldade (Muito Fácil a Muito Difícil), 10 logins fixos e porcentagem de acerto salva por usuário/baralho — que só pode melhorar a cada 15 dias.

Stack: Next.js (App Router) + NextAuth (login usuário/senha) + Prisma + Postgres. Feito para deploy na Vercel.

## 1. Rodar localmente

Requer um Postgres acessível (pode ser Docker local, Neon, Supabase, etc).

```bash
npm install
cp .env.example .env
# edite .env com sua DATABASE_URL e um NEXTAUTH_SECRET (gere com: openssl rand -base64 32)

npx prisma db push   # cria as tabelas
npm run db:seed      # cria os 3 baralhos e os 10 usuários

npm run dev
```

O `db:seed` gera 10 usuários (`usuario1` a `usuario10`) com senhas aleatórias e grava as senhas em texto puro em `credentials.txt` (arquivo local, não versionado). Distribua essas credenciais aos 10 jogadores.

**Atenção:** rodar o seed de novo gera senhas novas para todo mundo (o script sempre atualiza a senha). Rode apenas uma vez em produção, a menos que queira resetar as senhas.

## 2. Deploy na Vercel

1. Suba este projeto para um repositório Git (GitHub/GitLab/Bitbucket) e importe-o na Vercel (novo projeto).
2. No projeto da Vercel, aba **Storage**, crie um banco **Postgres** (Neon) e conecte ao projeto — isso já preenche a variável `DATABASE_URL` automaticamente.
3. Em **Settings → Environment Variables**, adicione:
   - `NEXTAUTH_SECRET`: um valor aleatório (`openssl rand -base64 32`).
   - `NEXTAUTH_URL`: normalmente não é necessário na Vercel (ela detecta sozinha), mas pode definir como a URL final do projeto se tiver problemas de login.
4. Faça o deploy.
5. Depois do primeiro deploy, rode as migrações e o seed **contra o banco de produção**. O jeito mais simples é rodar localmente apontando para a `DATABASE_URL` de produção (copie o valor do painel da Vercel para o seu `.env` local temporariamente):
   ```bash
   npx prisma db push
   npm run db:seed
   ```
   Isso cria os 3 baralhos e os 10 logins. Guarde o `credentials.txt` gerado — são as senhas reais dos 10 usuários.

## 3. Como funciona a pontuação

- Cada baralho tem 12 cartas distribuídas nos 5 níveis (Muito Fácil, Fácil, Médio, Difícil, Muito Difícil).
- Ao jogar, o usuário revela a resposta de cada carta e marca "Acertei" ou "Errei" (autoavaliação).
- No fim, calcula-se a % de acerto (cartas certas / 12).
- Essa % só substitui a pontuação salva do usuário naquele baralho se:
  - for a primeira vez jogando aquele baralho, OU
  - já se passaram 15 dias desde a última atualização da pontuação **e** a nova % é maior que a salva.
- Caso contrário, a tentativa é registrada mas a pontuação salva não muda — o painel mostra quantos dias faltam para poder melhorar.

## 4. Conteúdo dos baralhos

Os 3 baralhos (`Geografia do Brasil`, `Matemática Básica`, `Vocabulário em Inglês`) estão com **conteúdo de exemplo** em [prisma/seed.ts](prisma/seed.ts). Edite o array `decks` nesse arquivo com as perguntas/respostas reais e rode `npm run db:seed` novamente para atualizar os baralhos (isso não mexe nas pontuações já salvas dos usuários, só no conteúdo das cartas).

## 5. Estrutura

- `prisma/schema.prisma` — modelos `User`, `Deck`, `Card`, `Score`.
- `src/lib/auth.ts` — configuração do NextAuth (login usuário/senha).
- `src/lib/cooldown.ts` — regra dos 15 dias.
- `src/app/dashboard` — lista de baralhos com % e status de cooldown.
- `src/app/play/[slug]` — tela do jogo.
- `src/app/api/scores` — endpoint que salva a pontuação respeitando a regra dos 15 dias.
