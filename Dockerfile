FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

RUN npm audit --audit-level=moderate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
