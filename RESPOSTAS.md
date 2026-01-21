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

#### Backend

**Schema Prisma**

**Repositories**

**Services**

**API Routes**

#### Frontend

**Hooks**

**Componentes**

**Integracao**
