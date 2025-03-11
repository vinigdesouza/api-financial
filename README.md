## Description

API de transaçãocões e contas bancárias.

## Primeiros passos

Para rodar o projeto com Docker, utilize o comando abaixo. Ele irá instalar as dependências e subir o banco PostgreSQL e o Redis:

```bash
$ docker-compose up
```

Se preferir rodar o projeto localmente, primeiro instale as dependências:

```bash
$ npm install
```

Depois suba o projeto

```bash
$ npm run start:dev
```

## Rodar os testes

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Config

Sempre criar o `.env` na raiz do projeto e colocar as mesmas variaveis que estão no `.env.development.local`. Os tokens jwt para autenticação estão nesse arquivo também, para testar as rotas localmente utilize o `TOKEN_ADMIN_SUCESSO`. A rota de criar transações só funciona para usuários `admin`, portanto para garantir que todas as rotas funcionarão sem nenhum probmema, sempre use esse token. Nessa mesma rota para criar uma transação agendada deve ser enviado no payload o parametro `scheduled_at`.

## Documentation

A documentação detalhada das rotas está disponível no Swagger. Após rodar o projeto, acesse a documentação pelo seguinte link:

```bash
http://localhost:3000/api
```