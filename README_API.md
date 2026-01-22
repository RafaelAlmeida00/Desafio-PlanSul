# Documentacao da API

API REST para gerenciamento de produtos, categorias, estoque e movimentacoes.

## Base URL

```
http://localhost:3000/api
```

## Formato de Resposta

Todas as respostas sao retornadas em JSON. IDs do tipo BigInt sao serializados como strings.

---

## Produtos

### Listar Produtos

```http
GET /api/produtos
```

**Query Parameters:**

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| busca | string | Busca por nome, SKU ou marca |
| categoria_id | number | Filtra por categoria |
| page | number | Numero da pagina (padrao: 1) |
| limit | number | Registros por pagina (padrao: 50) |

**Exemplo Request:**
```bash
curl "http://localhost:3000/api/produtos?busca=teclado&categoria_id=1&page=1&limit=20"
```

**Exemplo Response (200):**
```json
[
  {
    "id": "1",
    "sku": "TECH-001",
    "nome": "Teclado Mecanico",
    "categoria_id": "1",
    "estoque_minimo": 10,
    "marca": "Logitech",
    "criado_em": "2024-01-15T10:00:00.000Z",
    "categorias": {
      "id": "1",
      "nome": "Perifericos"
    }
  }
]
```

### Obter Produto por ID

```http
GET /api/produtos/:id
```

**Exemplo Response (200):**
```json
{
  "id": "1",
  "sku": "TECH-001",
  "nome": "Teclado Mecanico",
  "categoria_id": "1",
  "estoque_minimo": 10,
  "marca": "Logitech",
  "criado_em": "2024-01-15T10:00:00.000Z",
  "categorias": {
    "id": "1",
    "nome": "Perifericos"
  }
}
```

**Codigos de Status:**
- 200: Sucesso
- 404: Produto nao encontrado
- 400: ID invalido

### Criar Produto

```http
POST /api/produtos
```

**Body Parameters:**

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| sku | string | Sim | Codigo unico do produto |
| nome | string | Sim | Nome do produto |
| categoria_id | number | Nao | ID da categoria |
| estoque_minimo | number | Nao | Quantidade minima em estoque |
| marca | string | Nao | Marca do produto |

**Exemplo Request:**
```bash
curl -X POST "http://localhost:3000/api/produtos" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TECH-002",
    "nome": "Mouse Wireless",
    "categoria_id": 1,
    "estoque_minimo": 5,
    "marca": "Logitech"
  }'
```

**Exemplo Response (201):**
```json
{
  "id": "2",
  "sku": "TECH-002",
  "nome": "Mouse Wireless",
  "categoria_id": "1",
  "estoque_minimo": 5,
  "marca": "Logitech",
  "criado_em": "2024-01-15T12:00:00.000Z"
}
```

**Codigos de Status:**
- 201: Produto criado
- 400: SKU ou nome ausentes

### Atualizar Produto

```http
PUT /api/produtos/:id
```

**Body Parameters:** Mesmos do POST (todos opcionais)

**Exemplo Request:**
```bash
curl -X PUT "http://localhost:3000/api/produtos/1" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teclado Mecanico RGB",
    "estoque_minimo": 15
  }'
```

**Codigos de Status:**
- 200: Produto atualizado
- 404: Produto nao encontrado

### Excluir Produto

```http
DELETE /api/produtos/:id
```

**Codigos de Status:**
- 204: Produto excluido
- 404: Produto nao encontrado

---

## Categorias

### Listar Categorias

```http
GET /api/categorias
```

**Query Parameters:**

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| busca | string | Busca por nome ou descricao |
| page | number | Numero da pagina |
| limit | number | Registros por pagina |

**Exemplo Response (200):**
```json
[
  {
    "id": "1",
    "nome": "Perifericos",
    "descricao": "Teclados, mouses e outros perifericos",
    "criado_em": "2024-01-15T10:00:00.000Z"
  }
]
```

### Obter Categoria por ID

```http
GET /api/categorias/:id
```

### Criar Categoria

```http
POST /api/categorias
```

**Body Parameters:**

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| nome | string | Sim | Nome da categoria |
| descricao | string | Nao | Descricao da categoria |

**Exemplo Request:**
```bash
curl -X POST "http://localhost:3000/api/categorias" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Monitores",
    "descricao": "Monitores e displays"
  }'
```

### Atualizar Categoria

```http
PUT /api/categorias/:id
```

### Excluir Categoria

```http
DELETE /api/categorias/:id
```

---

## Estoque

### Listar Estoque

```http
GET /api/estoque
```

**Query Parameters:**

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| produto_id | number | Filtra por produto |
| busca | string | Busca por nome/SKU do produto |
| abaixo_minimo | boolean | Filtra itens abaixo do minimo ("true"/"false") |
| page | number | Numero da pagina |
| limit | number | Registros por pagina |

**Exemplo Request:**
```bash
curl "http://localhost:3000/api/estoque?abaixo_minimo=true"
```

**Exemplo Response (200):**
```json
[
  {
    "id": "1",
    "produto_id": "1",
    "quantidade": 25,
    "atualizado_em": "2024-01-15T14:00:00.000Z",
    "criado_em": "2024-01-15T10:00:00.000Z",
    "produto": {
      "id": "1",
      "nome": "Teclado Mecanico",
      "sku": "TECH-001"
    }
  }
]
```

### Obter Estoque por ID

```http
GET /api/estoque/:id
```

### Criar Estoque

```http
POST /api/estoque
```

**Body Parameters:**

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| produto_id | number | Sim | ID do produto |
| quantidade | number | Nao | Quantidade inicial (padrao: 0) |

**Codigos de Status:**
- 201: Estoque criado
- 400: produto_id ausente ou estoque ja existe para o produto

---

## Movimentacoes de Estoque

### Listar Movimentacoes

```http
GET /api/estoque_movimentacoes
```

**Query Parameters:**

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| produto_id | number | Filtra por produto |
| tipo | string | Filtra por tipo: "entrada" ou "saida" |
| page | number | Numero da pagina |
| limit | number | Registros por pagina |

**Exemplo Request:**
```bash
curl "http://localhost:3000/api/estoque_movimentacoes?tipo=entrada&produto_id=1"
```

**Exemplo Response (200):**
```json
[
  {
    "id": "1",
    "produto_id": "1",
    "quantidade": 50,
    "tipo": "entrada",
    "criado_em": "2024-01-15T12:00:00.000Z",
    "produto": {
      "id": "1",
      "nome": "Teclado Mecanico",
      "sku": "TECH-001"
    }
  }
]
```

### Obter Movimentacao por ID

```http
GET /api/estoque_movimentacoes/:id
```

### Registrar Movimentacao

```http
POST /api/estoque_movimentacoes
```

**Body Parameters:**

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| produto_id | number | Sim | ID do produto |
| quantidade | number | Sim | Quantidade (deve ser > 0) |
| tipo | string | Sim | "entrada" ou "saida" |

**Exemplo Request - Entrada:**
```bash
curl -X POST "http://localhost:3000/api/estoque_movimentacoes" \
  -H "Content-Type: application/json" \
  -d '{
    "produto_id": 1,
    "quantidade": 100,
    "tipo": "entrada"
  }'
```

**Exemplo Request - Saida:**
```bash
curl -X POST "http://localhost:3000/api/estoque_movimentacoes" \
  -H "Content-Type: application/json" \
  -d '{
    "produto_id": 1,
    "quantidade": 10,
    "tipo": "saida"
  }'
```

**Codigos de Status:**
- 201: Movimentacao registrada
- 400: Dados invalidos ou estoque insuficiente para saida
- 404: Estoque do produto nao encontrado

---

## Codigos de Erro

| Codigo | Descricao |
|--------|-----------|
| 400 | Requisicao invalida (dados faltando ou incorretos) |
| 404 | Recurso nao encontrado |
| 500 | Erro interno do servidor |

**Formato de Erro:**
```json
{
  "error": "Mensagem descritiva do erro"
}
```

**Erros Especificos de Movimentacao:**
- `Estoque insuficiente. Disponivel: X, Solicitado: Y`
- `Estoque nao encontrado para o produto X`
