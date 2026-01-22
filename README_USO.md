# Guia de Uso do Projeto

Sistema de gestao de estoque desenvolvido com Next.js, Prisma e PostgreSQL.

## Pre-requisitos

- Node.js 18+
- npm
- Docker e Docker Compose

## Instalacao

### 1. Clone o repositorio

```bash
git clone https://github.com/Plansul/junior-technical-assessment.git
cd junior-technical-assessment
```

### 2. Instale as dependencias

```bash
npm install
```

### 3. Inicie o banco de dados

```bash
docker-compose up -d
```

Isso iniciara um container PostgreSQL na porta 5433.

### 4. Configure as variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/postgres?client_encoding=utf8"
```

### 5. Gere o cliente Prisma

```bash
npx prisma generate
```

### 6. Execute a aplicacao

```bash
npm run dev
```

Acesse: http://localhost:3000

## Scripts Disponiveis

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Compila a aplicacao para producao |
| `npm run start` | Inicia o servidor de producao |
| `npm run lint` | Executa verificacao de codigo |
| `npx prisma studio` | Interface visual do banco de dados |
| `npx prisma generate` | Gera o cliente Prisma |

## Estrutura do Projeto

```
junior-technical-assessment/
├── app/                    # Next.js App Router
│   ├── api/                # Rotas da API
│   │   ├── categorias/
│   │   ├── produtos/
│   │   ├── estoque/
│   │   └── estoque_movimentacoes/
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Componentes React
│   ├── views/              # Paginas principais
│   ├── ui/                 # Componentes base
│   └── ...
├── hooks/                  # React Hooks
├── services/               # Logica de negocio
├── repositories/           # Acesso a dados
├── lib/                    # Utilitarios
├── prisma/                 # Schema do banco
├── sql/                    # Scripts SQL
└── generated/              # Codigo gerado (Prisma)
```

## Arquitetura

O projeto segue uma arquitetura em camadas:

```
┌─────────────────────────────┐
│   Components (React)        │  <- Interface do usuario
├─────────────────────────────┤
│   API Routes (Next.js)      │  <- Endpoints HTTP
├─────────────────────────────┤
│   Services                  │  <- Logica de negocio
├─────────────────────────────┤
│   Repositories              │  <- Acesso a dados
├─────────────────────────────┤
│   Prisma + PostgreSQL       │  <- Banco de dados
└─────────────────────────────┘
```

## Banco de Dados

### Configuracao Docker

- **Imagem:** postgres:17-alpine
- **Container:** nextjs_postgres_db_v17
- **Porta:** 5433 (local) -> 5432 (container)
- **Usuario:** postgres
- **Senha:** postgres
- **Banco:** postgres

### Tabelas

| Tabela | Descricao |
|--------|-----------|
| categorias | Categorias de produtos |
| produtos | Catalogo de produtos |
| estoque | Quantidade em estoque |
| estoque_movimentacoes | Historico de entradas/saidas |

### Comandos Uteis

```bash
# Verificar container
docker ps | grep nextjs_postgres_db_v17

# Acessar banco via terminal
docker exec -it nextjs_postgres_db_v17 psql -U postgres

# Reiniciar banco com dados iniciais
docker exec -i nextjs_postgres_db_v17 psql -U postgres -d postgres < sql/init.sql

# Parar container
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

## Verificacao de Funcionamento

### 1. Verifique o container Docker

```bash
docker ps
```

Deve mostrar `nextjs_postgres_db_v17` em execucao.

### 2. Teste a conexao com o banco

```bash
npx prisma studio
```

Abre interface visual em http://localhost:5555

### 3. Acesse a aplicacao

Abra http://localhost:3000 no navegador.

### 4. Teste a API

```bash
# Listar produtos
curl http://localhost:3000/api/produtos

# Listar categorias
curl http://localhost:3000/api/categorias

# Listar estoque
curl http://localhost:3000/api/estoque
```

## Solucao de Problemas

### Erro de conexao com banco

1. Verifique se o container esta rodando:
   ```bash
   docker-compose up -d
   ```

2. Verifique as variaveis de ambiente no `.env`

3. Regenere o cliente Prisma:
   ```bash
   npx prisma generate
   ```

### Porta 5433 em uso

Pare outros containers ou altere a porta no `docker-compose.yml`.

### Erro de tipos TypeScript

```bash
npx tsc --noEmit
```

## Producao

### Build

```bash
npm run build
```

### Executar

```bash
npm run start
```

A aplicacao estara disponivel em http://localhost:3000
