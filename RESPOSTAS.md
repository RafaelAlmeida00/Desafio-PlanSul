# Reflexao Tecnica - Desafio FullStack Plansul

**Candidato:** Rafael de Souza Almeida
**Data:** 21/01/2026

---

## 1. O que voce fez?

### Parte 1: Debugging do Backend - EXTRA

#### Problema Identificado - EXTRA
3 high severity vulnerabilities na instalação das bibliotecas via `npm install`

#### Processo de Investigacao
1. Primeiro ao identificar o erros de vulnerabilidade, testei a aplicação de correções de vulnerabilidades padrão do npm `npm audit fix`
2. O processo funcionou, não foi necessário qualquer análise complementar.

#### Solucao Implementada
PS C:\Users\Rafael\Documents\Desafio PlanSul\junior-technical-assessment> npm install
>> 

added 522 packages, and audited 523 packages in 2m

164 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
PS C:\Users\Rafael\Documents\Desafio PlanSul\junior-technical-assessment> npm audit fix

added 4 packages, removed 2 packages, changed 22 packages, and audited 525 packages in 21s

164 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

#### Justificativa
É sempre importante resolver vulnerabilidades apontadas pelos módulos ao instalar, pois elas podem ser exploradas como métodos de Prototype Pollution, ReDoS, Arbitrary Code Execution e entre outros tipos de exploração de falhas em pacotes Node.js.


### Parte 1: Debugging do Backend

#### Problema Identificado
Erro na listagem de produtos pela API
- Request: `GET /api/produtos`
- Response: `500 Internal Server Error`
- Body: `{ "error": "erro desconhecido" }`
- Error: `Failed to fetch products`


#### Processo de Investigacao
1. Primeiro tentei replicar o erro, que com sucesso foi replicado e visualizado pela ferramenta DevTools (F12 > Network), onde foi possível identificar os detalhes da requisição apresentada acima na identificação do problema.
2. Constatado o erro que era um forte indício de que o problema estava no método do controller da API ou do repository, então analisei o fluxo de dados.

Frontend (produtos-view.tsx) - useProdutos()
Hook (use-produtos.ts) - fetchProdutos()
API Route (app/api/produtos/route.ts)  ← BUG AQUI - (deveria chamar service)
Service (produtos.service.ts) - getAllProdutos()
Repository (produtos.repository.ts) - findAll()
Prisma → PostgreSQL

3. Constatei que a função não estava implementada chamando service:

export async function GET() {
  return NextResponse.json({ error: 'erro desconhecido' }, { status: 500 });
}

#### Solucao Implementada

export function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

---

export async function GET() {
  try {
    const produtos = await service.getAllProdutos();
    return NextResponse.json(serializeBigInt(produtos));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Falha ao buscar produtos' }, { status: 500 });
  }
}

#### Justificativa
Implementei a função e corrigi um padrão de repetição de código criando `libs/serialize.ts` para implementar de forma eficiente e melhor manutenibilidade o método de serialização do array e adicionei try catch padronizando o get categorias também. 

---

### Parte 2: Modulo de Estoque

#### Processo de Implementação
1. Primeiro eu analisei a arquitetura de como funcionava já a aplicação em layers, basicamente é:


| Camada | Responsabilidade | Arquivos |
|--------|------------------|----------|
| **Presentation** | UI, interacao usuario, estado local | `components/`, `hooks/`, `app/page.tsx` |
| **API Routes** | Endpoints HTTP, validacao, serializacao | `app/api/**/*.ts` |
| **Services** | Logica de negocio, regras | `services/*.service.ts` |
| **Repositories** | Queries Prisma, CRUD | `repositories/*.repository.ts` |
| **Data** | Persistencia, schema | `prisma/`, `lib/db.ts` |

Então temos uma visão de implementação clara:

Presentation > (Consome) > API Routes > (Consome) > Repositories (Consome) > Database

2. Depois de ter a visão das camadas que deveriam ser implementadas, ficou bem simples, pois o código já tem uma base que pode ser facilmente reutilizável, então a ordem dos layers pouco importou na implementação.

2. 1. Primeiro implementei o schema de dados no Prisma e a API reutilizando o código.
2. 2. Depois reutilizei os services e repositories para implementação.

3. Nessa parte eu tinha a base já pronta, mas nenhuma regra de negócio implementada. Então pensei no que deveria ser implementado como regra de negócio pensando no sistema proposto e na descrição do desafio e cheguei a algumas conclusões. Implementei as regras de transação entre movimentações de estoque e o estoque do produto. A ideia foi usar transação Prisma para atomicidade, validar os estoques insuficiente para saídas, me dei liberdade de criar alguns errros customizáveis, para evitar problemas lógicos. 
Então o estoque só pode ser alterado via movimentações, saídas maiores que estoque disponível são bloqueadas e movimentações são imutáveis.

4. Fiz testes diretos, não escrevi nenhum teste pois acredito que fugiria do escopo do desafio, mas ficará como observação na análise técnica.

5. Por fim implementei o front-end, mantendo o padrão já estabelecido de ui/ux apenas fazendo o CRUD na tela.

6. Tive alguns problemas de configuração do UTF-8, mas foi resolvido adicionando na string de conexão a declaração.

#### Backend

**Schema Prisma**
model produtos {
  id             BigInt      @id @default(autoincrement())
  categoria_id   BigInt?
  sku            String      @unique @db.VarChar(50)
  nome           String      @db.VarChar(255)
  estoque_minimo Int?        @default(0)
  marca          String?     @default("Generico") @db.VarChar(100)
  criado_em      DateTime?   @default(now()) @db.Timestamp(6)
  categorias     categorias? @relation(fields: [categoria_id], references: [id], onDelete: NoAction, onUpdate: NoAction)
  estoque        estoque?
  estoque_movimentacoes estoque_movimentacoes[]
}

enum TipoMovimentacao {
  entrada
  saida
}

model estoque {
  id            BigInt    @id @default(autoincrement())
  produto_id    BigInt    @unique
  quantidade    Int       @default(0)
  atualizado_em DateTime? @default(now()) @db.Timestamp(6)
  produto       produtos  @relation(fields: [produto_id], references: [id], onDelete: Cascade)
  criado_em  DateTime?         @default(now()) @db.Timestamp(6)
}

model estoque_movimentacoes {
  id         BigInt            @id @default(autoincrement())
  produto_id BigInt
  quantidade Int
  tipo       TipoMovimentacao
  criado_em  DateTime?         @default(now()) @db.Timestamp(6)
  produto    produtos          @relation(fields: [produto_id], references: [id], onDelete: Cascade)
}


**Repositories**
/repositories/estoque.repository.ts
/repositories/estoque_movimentacoes.repository.ts

**Services**
/services/estoque.service.ts
/services/estoque_movimentacoes.service.ts

**API Routes**
/api/estoque
/api/estoque/[id]
/api/estoque_movimentacoes
/api/estoque_movimentacoes/[id]

#### Frontend

**Hooks**
hooks/use-estoque.ts - Hook para buscar dados de estoque
hooks/use-estoque-movimentacoes.ts - Hooks para buscar e criar movimentações

**Componentes**
components/estoque/estoque-columns.ts - Colunas da tabela de estoque
components/movimentacoes/movimentacao-columns.ts - Colunas da tabela de movimentações
components/movimentacoes/movimentacao-add-modal.tsx - Modal para registrar movimentações
components/views/estoque-view.tsx - Tela de listagem do estoque
components/views/movimentacoes-view.tsx - Tela de listagem de movimentações

**Integracao**
app/page.tsx - Adicionadas as abas "Estado do Estoque" e "Histórico de Movimentações"
