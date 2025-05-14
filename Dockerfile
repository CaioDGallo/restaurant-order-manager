FROM node:22.15.0-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .

FROM base AS development

ENV NODE_ENV=development

RUN npm install
CMD ["npm", "run", "dev"]

FROM base AS production

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
