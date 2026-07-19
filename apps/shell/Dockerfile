FROM node:22-slim AS build
WORKDIR /repo
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/shell/package.json apps/shell/package.json
RUN cd apps/shell && npm install
COPY apps/shell apps/shell
RUN cd apps/shell && npm run build

FROM nginx:1.27-alpine
COPY --from=build /repo/apps/shell/dist /usr/share/nginx/html
COPY apps/shell/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
