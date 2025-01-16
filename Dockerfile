FROM node:lts AS base

FROM base AS builder
WORKDIR /app

COPY package*.json .

RUN npm install --ci

FROM builder AS runner 

WORKDIR /app

COPY --from=builder /app/node_modules ./

CMD npm start
