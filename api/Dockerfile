
FROM node:20-alpine

WORKDIR /app

# deps
COPY package.json ./
RUN npm install --omit=dev

# código
COPY . .

ENV PORT=8051
EXPOSE 8051

CMD ["npm","start"]
