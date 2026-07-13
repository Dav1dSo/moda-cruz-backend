# moda-cruz-backend

Backend da plataforma Moda Cruz. Monorepo NestJS 11 com dois apps e duas libs:

- `apps/api` — API HTTP (porta 5555; Swagger em `/api/docs` fora de produção)
- `apps/notification-services` — consumidor RabbitMQ que envia e-mails (SendGrid)
- `libs/database` (`@app/database`) — PrismaService (PostgreSQL)
- `libs/contracts` (`@contracts/*`) — contratos de eventos e constantes do broker

A arquitetura obrigatória (Controller → UseCase → Repository → Prisma) está documentada em `.claude/skills/moda-cruz-backend-patterns/`.

## Setup

```bash
npm install
npx prisma migrate dev
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim | Conexão PostgreSQL (Prisma) |
| `RABBITMQ_URL` | sim | Conexão AMQP — sem fallback; o boot falha se ausente |
| `JWT_SECRET` | sim | Assina os access tokens (15min) |
| `JWT_REFRESH_SECRET` | sim | Assina os refresh tokens (7d) — deve ser diferente do `JWT_SECRET` |
| `JWT_RESET_PASSWORD_SECRET` | sim | Assina os tokens de reset de senha (30min, uso único) |
| `FRONTEND_URL` | sim | Origem liberada no CORS e base do link de reset de senha |
| `SENDGRID_API_KEY` | sim (notifications) | Chave do SendGrid |
| `EMAIL_FROM` | sim (notifications) | Remetente dos e-mails |
| `TRUST_PROXY_HOPS` | não (default `0`) | Número de proxies confiáveis à frente da API. **Atrás de nginx/ELB, configure `1`** — sem isso o rate limiting enxerga todos os clientes com o IP do proxy |
| `PORT` | não (default `5555`) | Porta da API |

## Comandos

```bash
npm run start:dev                 # api em watch
npm run start:notifications:dev   # consumidor de notificações em watch
npm run build                     # build de todos os apps
npm run lint                      # eslint --fix
npm test                          # suíte jest completa
npx prisma migrate dev            # após alterar prisma/schema.prisma
```

## RabbitMQ — fila de notificações

A fila `notifications_queue` é declarada com dead-letter queue (`notifications_queue.dlq`): mensagens que falham no processamento (ex.: SendGrid indisponível) são rejeitadas sem requeue e caem na DLQ em vez de serem perdidas.

**Migração (uma vez por ambiente provisionado antes desta versão):** filas duráveis existentes não aceitam mudança de `arguments`. O boot do notification-services detecta a incompatibilidade e falha com mensagem explícita — nesse caso, esvazie e delete a fila `notifications_queue` (management UI ou `rabbitmqctl delete_queue notifications_queue`) e suba o serviço novamente; ele recria a fila com a configuração correta.
