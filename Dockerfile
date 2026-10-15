FROM node:24.19.0-trixie-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@9.12.3

FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /usr/src/app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @expotes/api build && pnpm --filter @expotes/sdk build && pnpm --filter expotes-dashboard build
RUN pnpm deploy --filter=@expotes/api --prod /prod/api

FROM base
ENV NODE_ENV=production
ENV PROD_STATIC_PATH="/app/dist/static"
WORKDIR /app
COPY --from=build --chown=node:node /prod/api /app/
COPY --from=build --chown=node:node /usr/src/app/packages/expotes-dashboard/out /app/dist/static
USER node
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
