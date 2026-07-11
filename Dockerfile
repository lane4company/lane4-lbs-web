# syntax=docker/dockerfile:1.3

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG TARGET_ENV
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
# ponytail: prod 전용 파이프라인. dev 배포 추가 시 .env.development→.env.production 치환 분기 필요
RUN yarn build

# Production image — standalone output만 실어 이미지 최소화
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Docker가 HOSTNAME을 컨테이너 ID로 세팅 → standalone 서버가 잘못된 호스트에 바인딩되는 것 방지
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# standalone 출력엔 .env 미포함 → 런타임(NEXTAUTH_URL/SECRET) 로드 위해 별도 복사
COPY --from=builder --chown=nextjs:nodejs /app/.env.production ./.env.production

USER nextjs

EXPOSE 8080

# server.js는 next build의 standalone 출력이 생성
CMD ["node", "server.js"]
