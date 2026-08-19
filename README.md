# Sistema de inscricoes EJC

Projeto enxuto para deploy na Vercel com:

- validacao por codigo unico
- formulario de inscricao com foto
- painel administrativo protegido por senha
- sincronizacao opcional com Notion
- suporte a armazenamento local para desenvolvimento
- suporte a Vercel Blob para producao

## Como rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. O projeto ja esta com um `.env` local configurado para desenvolvimento.

3. Rode:

```bash
npm run dev
```

4. Acesse:

- `/` para a inscricao publica
- `/admin` para o painel administrativo

## Credenciais locais

Para o ambiente local atual:

```env
STORAGE_PROVIDER=local
ADMIN_PASSWORD=EJC2026Admin!
SESSION_SECRET=ejc-local-session-2026-secret
```

Nesse modo:

- codigos e inscricoes ficam em `data/.local-storage`
- nao precisa de `BLOB_READ_WRITE_TOKEN`
- fotos ficam salvas inline no JSON apenas para testes locais

## Variaveis de ambiente

```env
STORAGE_PROVIDER=local
BLOB_READ_WRITE_TOKEN=
ADMIN_PASSWORD=
SESSION_SECRET=
NOTION_API_KEY=
NOTION_DATA_SOURCE_ID=
```

`NOTION_API_KEY` e `NOTION_DATA_SOURCE_ID` sao opcionais.

## Deploy na Vercel

Para deploy real na Vercel:

1. Crie um Blob Store no projeto.
2. Configure `BLOB_READ_WRITE_TOKEN`.
3. Configure `ADMIN_PASSWORD`.
4. Configure `SESSION_SECRET`.
5. Nao use `STORAGE_PROVIDER=local` no ambiente da Vercel.
6. Faca um novo deploy.

Os arquivos no Blob ficam organizados assim:

- `codes/` arquivos JSON dos codigos
- `registrations/` arquivos JSON das inscricoes
- `photos/` fotografias enviadas

## Como entrar no admin

1. Acesse `/admin`.
2. Informe a `ADMIN_PASSWORD`.
3. Crie ou gere codigos.

Um codigo deixa de estar disponivel depois que a inscricao e salva com sucesso.

## Alterando os campos da inscricao

O ponto principal de configuracao fica em `data/registration-config.js`.

Ali voce pode alterar:

- titulo e textos da tela publica
- limite do codigo
- tipos e tamanho maximo da foto
- lista de campos do formulario
- obrigatoriedade, label, placeholder e maxLength de cada campo

Se quiser mudar comportamento visual do admin ou da pagina publica:

- `public/script.js`
- `public/admin.js`
- `public/styles.css`

## Como configurar o Notion

A integracao e opcional e acontece depois que a inscricao ja foi salva.

1. Crie uma integracao interna no Notion e copie a chave para `NOTION_API_KEY`.
2. Crie uma base e copie o data source id para `NOTION_DATA_SOURCE_ID`.
3. Compartilhe a base com a integracao.
4. Crie propriedades com estes nomes:
   - `Nome` como titulo
   - `Codigo` como rich text
   - `Telefone` como rich text
   - `Email` como email
   - `Cidade` como rich text
   - `Data de nascimento` como date
   - `Data da inscricao` como date
   - `Foto` como url
   - `Observacoes` como rich text

Se o Notion falhar, a inscricao continua salva normalmente.

## Rotas principais

- `/` tela publica de inscricao
- `/admin` painel administrativo
- `GET /api/registration-config`
- `POST /api/validate-code`
- `POST /api/register`
- `GET /api/admin-auth`
- `POST /api/admin-auth`
- `DELETE /api/admin-auth`
- `GET /api/admin-codes`
- `POST /api/admin-codes`
- `PATCH /api/admin-code`
- `GET /api/admin-registrations`
- `GET /api/admin-registration`
- `GET /api/admin-export`

## Gerar lista de codigos fora do painel

```bash
node scripts/generate-codes.mjs EJC2 20
```
