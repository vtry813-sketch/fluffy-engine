
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 10000

ENV MAIN_FILE=inconnu.js
ENV PORT=10000

CMD ["node", "inconnu.js"]
