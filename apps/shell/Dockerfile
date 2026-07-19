FROM node:22-slim AS build
RUN npm install -g pnpm@10.33.2
WORKDIR /repo
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY apps/shell/package.json apps/shell/package.json
COPY packages/auth/package.json packages/auth/package.json
RUN pnpm install --frozen-lockfile --filter @odic/shell...
COPY apps/shell apps/shell
COPY packages/auth packages/auth
RUN pnpm --filter @odic/shell build

FROM nginx:1.27-alpine
COPY --from=build /repo/apps/shell/dist /usr/share/nginx/html
COPY apps/shell/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
