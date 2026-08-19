# Sistema de inscricoes EJC

Projeto enxuto para deploy na Vercel com:

- validacao por codigo unico
- formulario de inscricao com foto
- armazenamento principal em JSON no Vercel Blob
- painel administrativo protegido por senha
- sincronizacao opcional com Notion

## Como rodar

1. Instale as dependencias:

```bash
npm install
```

2. Crie um arquivo `.env` com base em `.env.example`.

3. Rode localmente:

```bash
npm run dev
```

## Como configurar Vercel Blob

1. No projeto da Vercel, crie um Blob Store.
2. Copie o token de escrita para `BLOB_READ_WRITE_TOKEN`.
3. Faça um novo deploy depois de salvar a variavel.

Os arquivos ficam organizados assim:

- `codes/` arquivos JSON dos codigos
- `registrations/` arquivos JSON das inscricoes
- `photos/` fotografias enviadas

## Variaveis de ambiente

```env
BLOB_READ_WRITE_TOKEN=
ADMIN_PASSWORD=
SESSION_SECRET=
NOTION_API_KEY=
NOTION_DATA_SOURCE_ID=
```

`NOTION_API_KEY` e `NOTION_DATA_SOURCE_ID` sao opcionais.

## Como entrar no admin

1. Configure `ADMIN_PASSWORD`.
2. Acesse `/admin`.
3. Informe a senha.

Depois do login, a sessao fica em cookie seguro assinado no servidor.

## Como criar um codigo

No painel `/admin` voce pode:

- digitar manualmente um codigo de ate 8 caracteres alfanumericos
- usar o botao `Gerar codigo`
- desativar um codigo ainda nao utilizado

Um codigo so deixa de estar disponivel depois que a inscricao e salva com sucesso.

## Alterando os campos da inscricao

O ponto principal de configuracao fica em `data/registration-config.js`.

Ali voce pode alterar:

- titulo e textos da tela publica
- limite do codigo
- tipos e tamanho maximo da foto
- lista de campos do formulario
- obrigatoriedade, label, placeholder e maxLength de cada campo

Na maioria dos casos, basta editar:

- `data/registration-config.js`

Se quiser mudar comportamento visual do admin ou da pagina publica:

- `public/script.js`
- `public/admin.js`
- `public/styles.css`

## Como configurar o Notion

A integracao e opcional e acontece depois que a inscricao ja foi salva no Blob.

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

Se o Notion falhar, a inscricao continua salva normalmente no Blob.

## Como fazer deploy na Vercel

1. Suba o repositorio para o Git.
2. Importe o projeto na Vercel.
3. Configure as variaveis de ambiente.
4. Faça o deploy.

## Rotas principais

- `/` tela publica de inscricao
- `/admin` painel administrativo
- `POST /api/validate-code`
- `POST /api/register`
- `GET /api/admin-codes`
- `GET /api/admin-registrations`

## Gerar lista de codigos fora do painel

```bash
node scripts/generate-codes.mjs EJC2 20
```
