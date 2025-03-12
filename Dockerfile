FROM node:20

WORKDIR /app

ENV TZ=America/Sao_Paulo

RUN apt-get update && apt-get install -y tzdata && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm install

RUN npm audit

RUN apt-get update && apt-get install -y tzdata

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
