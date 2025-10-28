FROM node:18-alpine AS base
WORKDIR /app

COPY package.json ./
COPY client/package.json ./client/package.json

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["npm", "run", "start"]
