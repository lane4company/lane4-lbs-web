# syntax=docker/dockerfile:1.3

FROM node:22-alpine AS base
WORKDIR /app
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --pure-lockfile
COPY . .

FROM base AS build
ARG TARGET_ENV
ENV NODE_ENV=${TARGET_ENV}
WORKDIR /build
COPY --from=base /app ./
RUN yarn build

EXPOSE 8080
CMD yarn start
