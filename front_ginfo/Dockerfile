FROM node:23-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true

CMD ["npm", "run", "dev"]