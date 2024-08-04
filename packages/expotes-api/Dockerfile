FROM node:20-alpine AS base
###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM base AS basepnpm

# 启用 corepack 以支持 pnpm
RUN corepack enable
# 设置 PNPM_HOME 环境变量
ENV PNPM_HOME=/usr/local/bin

# 将 PNPM_HOME 添加到 PATH
ENV PATH=$PNPM_HOME:$PATH

# 安装指定版本的 pnpm (可选)
RUN corepack prepare pnpm@latest --activate

FROM basepnpm AS development

# Create app directory
WORKDIR /app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package.json ./
COPY --chown=node:node pnpm-lock.yaml ./

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN pnpm install --frozen-lockfile

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM basepnpm AS build

WORKDIR /app

COPY --chown=node:node package.json ./
COPY --chown=node:node pnpm-lock.yaml ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN pnpm run build

# Set NODE_ENV environment variable
ENV NODE_ENV=production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
# RUN pnpm install --frozen-lockfile --prod && pnpm store prune
# RUN pnpm install --frozen-lockfile

USER node

###################
# PRODUCTION
###################

FROM base AS production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/src/main.js" ]
