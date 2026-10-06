FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm --filter @saas/api prisma:generate && pnpm --filter @saas/api build
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S nest -G app
COPY --from=build --chown=nest:app /app/node_modules ./node_modules
COPY --from=build --chown=nest:app /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=nest:app /app/apps/api/prisma ./apps/api/prisma
USER nest
EXPOSE 4000
CMD ["node","apps/api/dist/main.js"]