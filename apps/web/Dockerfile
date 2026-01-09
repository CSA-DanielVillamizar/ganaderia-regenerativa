FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN npm install
RUN npm run build --workspace=@ganaderia/web

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
EXPOSE 3000
CMD ["npm", "start", "--workspace=@ganaderia/web"]
