FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm


FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=@expotes/api --prod /prod/api

FROM base

ENV PROD_STATIC_PATH="/app/dist/static"

COPY --from=build /prod/api /app/
COPY --from=build /usr/src/app/packages/expotes-dashboard/out /app/dist/static

WORKDIR /app
EXPOSE 3000
CMD [ "pnpm", "start:prod" ]