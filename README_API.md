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
- 400: ID invalido (`VALIDATION_ERROR`)
- 404: Produto nao encontrado (`NOT_FOUND`)

### Criar Produto

```http
POST /api/produtos
```

**Body Parameters:**

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| sku | string | Sim | Codigo unico do produto (max 50 caracteres) |
| nome | string | Sim | Nome do produto (max 255 caracteres) |
| categoria_id | number | Nao | ID da categoria |
| estoque_minimo | number | Nao | Quantidade minima em estoque |
| marca | string | Nao | Marca do produto (max 100 caracteres) |

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

> **Nota:** Ao criar um produto, um registro de estoque e automaticamente criado com quantidade = 0.

**Codigos de Status:**
- 201: Produto criado
- 400: SKU ou nome ausentes (`VALIDATION_ERROR`)
- 409: SKU ja existe (`UNIQUE_VIOLATION`)
- 409: Categoria invalida (`FK_VIOLATION`)

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
- 404: Produto nao encontrado (`NOT_FOUND`)
- 409: SKU ja existe (`UNIQUE_VIOLATION`)

### Excluir Produto

```http
DELETE /api/produtos/:id
```

**Codigos de Status:**
- 204: Produto excluido
- 404: Produto nao encontrado (`NOT_FOUND`)
- 409: Produto possui movimentacoes de estoque associadas (`FK_VIOLATION`)

**Exemplo Response (409):**
```json
{
  "error": "Nao e possivel excluir produto porque possui movimentacoes de estoque associadas. Exclua os movimentacoes de estoque primeiro.",
  "code": "FK_VIOLATION"
}
```

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

**Codigos de Status:**
- 200: Sucesso
- 400: ID invalido (`VALIDATION_ERROR`)
- 404: Categoria nao encontrada (`NOT_FOUND`)

### Criar Categoria

```http
POST /api/categorias
```

**Body Parameters:**

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| nome | string | Sim | Nome da categoria (max 100 caracteres) |
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

**Codigos de Status:**
- 201: Categoria criada
- 400: Nome ausente (`VALIDATION_ERROR`)
- 409: Nome ja existe (`UNIQUE_VIOLATION`)

### Atualizar Categoria

```http
PUT /api/categorias/:id
```

**Codigos de Status:**
- 200: Categoria atualizada
- 404: Categoria nao encontrada (`NOT_FOUND`)

### Excluir Categoria

```http
DELETE /api/categorias/:id
```

**Codigos de Status:**
- 204: Categoria excluida
- 404: Categoria nao encontrada (`NOT_FOUND`)
- 409: Categoria possui produtos associados (`FK_VIOLATION`)

**Exemplo Response (409):**
```json
{
  "error": "Nao e possivel excluir categoria porque possui produtos associados. Exclua os produtos primeiro.",
  "code": "FK_VIOLATION"
}
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

**Codigos de Status:**
- 200: Sucesso
- 400: ID invalido
- 404: Estoque nao encontrado

### Criar Estoque

```http
POST /api/estoque
```

> **Nota:** O estoque e criado automaticamente ao criar um produto. Use este endpoint apenas se precisar criar estoque manualmente para um produto existente.

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

**Codigos de Status:**
- 200: Sucesso
- 400: ID invalido
- 404: Movimentacao nao encontrada

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
- 400: Dados invalidos (`VALIDATION_ERROR`)
- 400: Estoque insuficiente para saida (`ESTOQUE_INSUFICIENTE`)
- 404: Estoque do produto nao encontrado (`NOT_FOUND`)
- 409: Requisicao ja em processamento (`REQUEST_IN_PROGRESS`)

---

## Idempotencia

O endpoint `POST /api/estoque_movimentacoes` possui protecao automatica contra requisicoes duplicadas baseada no conteudo do body.

### Como funciona

1. A API gera um hash SHA-256 do body da requisicao
2. Se o mesmo body for enviado novamente dentro de 30 segundos, a resposta cacheada e retornada
3. Apos 30 segundos, o cache expira e uma nova movimentacao pode ser criada com os mesmos dados
4. Respostas cacheadas incluem o header `Idempotency-Replayed: true`

### Beneficios

- Protecao automatica contra double-click do usuario
- Evita movimentacoes duplicadas em caso de retry automatico
- Nao requer configuracao no cliente

### Exemplo

```bash
# Primeira requisicao - processada normalmente (cria movimentacao)
curl -X POST "http://localhost:3000/api/estoque_movimentacoes" \
  -H "Content-Type: application/json" \
  -d '{"produto_id": 1, "quantidade": 100, "tipo": "entrada"}'

# Mesma requisicao dentro de 30s - retorna resposta cacheada (NAO cria nova movimentacao)
curl -X POST "http://localhost:3000/api/estoque_movimentacoes" \
  -H "Content-Type: application/json" \
  -d '{"produto_id": 1, "quantidade": 100, "tipo": "entrada"}'
# Response Header: Idempotency-Replayed: true

# Apos 30 segundos - cria nova movimentacao
curl -X POST "http://localhost:3000/api/estoque_movimentacoes" \
  -H "Content-Type: application/json" \
  -d '{"produto_id": 1, "quantidade": 100, "tipo": "entrada"}'
```

---

## Codigos de Erro

### Codigos HTTP

| Codigo | Descricao |
|--------|-----------|
| 400 | Requisicao invalida (dados faltando ou incorretos) |
| 404 | Recurso nao encontrado |
| 409 | Conflito (violacao de unicidade ou chave estrangeira) |
| 500 | Erro interno do servidor |

### Codigos de Erro da API

| Codigo | Status HTTP | Descricao |
|--------|-------------|-----------|
| VALIDATION_ERROR | 400 | Dados de entrada invalidos |
| NOT_FOUND | 404 | Recurso nao encontrado |
| UNIQUE_VIOLATION | 409 | Valor duplicado (ex: SKU ja existe) |
| FK_VIOLATION | 409 | Violacao de chave estrangeira |
| ESTOQUE_INSUFICIENTE | 400 | Estoque insuficiente para saida |
| DATABASE_ERROR | 500 | Erro de banco de dados |
| INTERNAL_ERROR | 500 | Erro interno do servidor |
| REQUEST_IN_PROGRESS | 409 | Requisicao duplicada em processamento |

### Formato de Erro

```json
{
  "error": "Mensagem descritiva do erro",
  "code": "CODIGO_DO_ERRO"
}
```

### Exemplos de Erros

**Validacao (400):**
```json
{
  "error": "SKU e Nome sao obrigatorios",
  "code": "VALIDATION_ERROR"
}
```

**Nao encontrado (404):**
```json
{
  "error": "Produto com ID 999 nao encontrado(a)",
  "code": "NOT_FOUND"
}
```

**Violacao de unicidade (409):**
```json
{
  "error": "Ja existe um registro com SKU: \"TECH-001\"",
  "code": "UNIQUE_VIOLATION"
}
```

**Estoque insuficiente (400):**
```json
{
  "error": "Estoque insuficiente. Disponivel: 5 unidades. Solicitado: 10 unidades.",
  "code": "ESTOQUE_INSUFICIENTE"
}
```

**Violacao de chave estrangeira (409):**
```json
{
  "error": "Nao e possivel excluir categoria porque possui produtos associados. Exclua os produtos primeiro.",
  "code": "FK_VIOLATION"
}
```
