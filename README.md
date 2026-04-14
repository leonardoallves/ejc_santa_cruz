# Mini sistema de cadastro EJC

Projeto simples para deploy no Vercel com:

- validacao por codigo pre-gerado
- confirmacao de cadastro
- painel administrativo protegido por token
- persistencia em Vercel KV quando configurado

## Observacao importante

Sem `KV_REST_API_URL` e `KV_REST_API_TOKEN`, as confirmacoes ficam apenas em memoria.
Isso serve para teste local, mas nao e adequado para producao no Vercel porque os dados
podem se perder a cada reinicio da funcao.

## Como funciona

1. Edite os codigos em `data/invite-codes.js`.
2. Configure `ADMIN_TOKEN` nas variaveis de ambiente do Vercel.
3. Se quiser persistencia real, configure `KV_REST_API_URL` e `KV_REST_API_TOKEN`.
4. Faça o deploy no Vercel.

## Estrutura

- `public/` paginas, scripts e estilos do frontend
- `api/` funcoes serverless
- `data/` codigos pre-gerados
- `lib/` utilitarios compartilhados
- `scripts/` scripts auxiliares

## Deploy no Vercel

1. Suba a pasta em um repositorio Git.
2. Importe o repositorio no painel da Vercel.
3. Em `Settings > Environment Variables`, cadastre:
   - `ADMIN_TOKEN`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
4. Faça um novo deploy.

## Rotas

- `/` tela publica de confirmacao
- `/admin` painel administrativo
- `POST /api/validate-code`
- `POST /api/confirm`
- `GET /api/confirmations?token=...`

## Desenvolvimento local

Se voce tiver o Vercel CLI:

```bash
vercel dev
```

## Gerar novos codigos

```bash
node scripts/generate-codes.mjs EJC-2026 50
```

Depois copie a lista gerada e substitua o conteudo de `data/invite-codes.js`.
