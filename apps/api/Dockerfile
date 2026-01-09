FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN npm install
RUN npm run build --workspace=@ganaderia/api

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/apps/api/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
