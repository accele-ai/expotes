FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable


FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=@expotes/api --prod /prod/api
RUN pnpm deploy --filter=@expotes/dashboard --prod /prod/dashboard

FROM base

ENV PROD_STATIC_PATH="/app/dashboard/dist"

COPY --from=build /prod/api /app/api
COPY --from=build /prod/dashboard /app/dashboard

WORKDIR /app/api
EXPOSE 3000
CMD [ "pnpm", "start:prod" ]