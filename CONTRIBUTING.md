# Contributing

Use Node 22+, pnpm 10+, Docker and Docker Compose.

1. pnpm install
2. cp .env.example .env
3. docker compose up -d postgres redis mailhog
4. pnpm --filter @saas/api prisma:migrate
5. pnpm --filter @saas/api prisma:seed
6. pnpm dev

Use Conventional Commit messages. Keep feature changes focused, add tests for behavior changes and update documentation when a public contract changes.