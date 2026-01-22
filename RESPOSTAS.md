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
Implementei a função e corrigi um padrão de repetição de código criando `libs/serialize.ts` para implementar de forma eficiente e melhor manutenibilidade o método de serialização do array e adicionei try catch padronizando o get categorias também. (Depois padronizei tudo com try catch no código e exceções mais claras)

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

3. Nessa parte eu tinha a base já pronta, mas nenhuma regra de negócio implementada. Então pensei no que deveria ser implementado como regra de negócio pensando no sistema proposto e na descrição do desafio e cheguei a algumas conclusões. Implementei as regras de transação entre movimentações de estoque e o estoque do produto. A ideia foi usar transação Prisma para atomicidade, validar os estoques insuficiente para saídas, me dei liberdade de alguns errros customizáveis, para evitar problemas lógicos. 
Então o estoque só pode ser alterado via movimentações, saídas maiores que estoque disponível são bloqueadas e movimentações são imutáveis.

#### Implicacoes:
1. **NAO deve existir** endpoint PUT/PATCH direto para alterar `estoque.quantidade`
2. A quantidade so muda via `POST /api/estoque_movimentacoes`
3. O service de movimentacoes deve:
   - Validar se saida nao deixa estoque negativo
   - Atualizar `estoque.quantidade` atomicamente
   - Usar transacao para garantir consistencia

#### Logica:
```
SE tipo == 'entrada':
    estoque.quantidade += movimentacao.quantidade

SE tipo == 'saida':
    SE estoque.quantidade >= movimentacao.quantidade:
        estoque.quantidade -= movimentacao.quantidade
    SENAO:
        ERRO: "Quantidade insuficiente em estoque"
```

4. Fiz testes diretos, não escrevi nenhum teste pois acredito que fugiria do escopo do desafio, mas ficará como observação na análise técnica.

5. Por fim implementei o front-end, mantendo o padrão já estabelecido de ui/ux apenas fazendo o CRUD na tela.

6. Tive alguns problemas de configuração do UTF-8, mas foi resolvido adicionando na string de conexão a declaração e atualizando o prisma.

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
hooks/use-estoque-movimentacoes.ts - Hooks para buscar e movimentações

**Componentes**
components/estoque/estoque-columns.ts - Colunas da tabela de estoque
components/movimentacoes/movimentacao-columns.ts - Colunas da tabela de movimentações
components/movimentacoes/movimentacao-add-modal.tsx - Modal para registrar movimentações
components/views/estoque-view.tsx - Tela de listagem do estoque
components/views/movimentacoes-view.tsx - Tela de listagem de movimentações

**Integracao**
app/page.tsx - Adicionadas as abas "Estado do Estoque" e "Histórico de Movimentações"

---

### Parte 3: Filtros e Ordenacao

#### Funcionalidades Implementadas
Componentes UI:
badge.tsx - Badge do shadcn com variantes (default, secondary, destructive, success, warning)
checkbox.tsx - Checkbox do Radix UI para selecao em lote

Componentes Custom:
search-input.tsx - Input de busca com debounce (300ms)
filter-pills.tsx - Pills visuais de filtros ativos
metrics-cards.tsx - Cards de metricas do dashboard
movements-chart.tsx - Grafico de barras com recharts

Filtros por Entidade:
produto-filters.tsx - Filtros de categoria, marca e estoque baixo
movimentacao-filters.tsx - Filtros de tipo, produto e periodo
estoque-filters.tsx - Filtro de status (OK, baixo, critico)

Hooks:
use-debounce.ts - Hook de debounce generico
use-dashboard-metrics.ts - Hook para metricas do dashboard
Arquivos Atualizados
data-table.tsx - Ordenacao visual, selecao em lote, empty states, filter pills
produtos-view.tsx - Integrado filtros, busca e filter pills
movimentacoes-view.tsx - Integrado filtros com datas e filter pills
estoque-view.tsx - Integrado filtro de status e filter pills
page.tsx - Adicionado dashboard com cards de metricas e grafico

Funcionalidades Implementadas:
Ordenacao Visual - Clique nos headers para ordenar, icones indicando direcao
Filter Pills - Tags visuais mostrando filtros ativos com botao de remover
Busca com Debounce - Campo de busca com debounce de 300ms
Dashboard de Metricas - Cards com total produtos, estoque baixo, entradas/saidas hoje
Grafico de Movimentacoes - Barras de entradas vs saidas dos ultimos 7 dias
Filtros por Entidade - Filtros especificos para produtos, movimentacoes e estoque
Empty States Contextuais - Mensagens uteis quando nao ha dados ou resultados
Selecao em Lote - Estrutura pronta (enableSelection prop no DataTable)
confirmacao de saida em modais

Melhoria nos feedbacks dos erros
Idempotência nas requisições
Melhoria na responsividade

#### Abordagem Escolhida
A abordagem que eu tive foi: Vamos implementar algumas regras de ouro do UI/UX, aprimorar e seguir o que foi pedido no teste em relação aos filtros. Mas não só implementar, criar facilidades para usuabilidade do usuário.
Ao mesmo tempo podemos mesmo com poucos dados trabalhar com os dashboards e visualização da analise de dados.

---

### Parte Final: Testes Gerais

#### Problema Identificado
O schema de validação updateProdutoSchema e updateCategoriaSchema exigem o campo id, mas ele não está é enviado nos defaultValues.
O react-hook-form com zodResolver falhava a validação silenciosamente quando campos obrigatórios estão faltando, impedindo o envio do formulário

#### Processo de Investigacao
1. Testei o envio pelo front, nada aconteceu.
2. Analisei o fluxo do forms até perceber e vi de forma clara a falta do id enviado.

#### Solucao Implementada
Adicionei id incluído ele nos defaultValues

---

#### Problema Identificado
Id incremental do schema prisma não seguia a sequência de implementação dos itens inciais do ao startar o banco, então conflitava novos itens com os iniciais gerando erro status 500.

#### Processo de Investigacao
1. Analisei via dev tools a requisição e ao analisar o payload percebi que o id estava conflitante com os itens iniciais criado no banco.
2. Analisei os ids dos itens criados ao iniciar o banco e confirmei a suspeita.

#### Solucao Implementada
Corrigi direto no init.sql para resetar as sequências após os inserts.

---

## 2. O que poderia ser diferente?

### 2.1 Tratamento de Erros nos Repositories - IMPLEMENTADO

**Situacao Antiga:**
Os repositories (`produtos.repository.ts`, `estoque.repository.ts`) nao possuem try-catch nas operacoes de banco.

**Abordagem Tomada:**
// Atual
async findAll() {
  return prisma.produtos.findMany({ include: { categorias: true } });
}

// Sugerido
async findAll() {
  try {
    return await prisma.produtos.findMany({ include: { categorias: true } });
  } catch (error) {
    throw new DatabaseError('Falha ao buscar produtos', { cause: error });
  }
}

**Ganho:** Erros de conexao/timeout sao capturados e tratados de forma previsivel, evitando crashes silenciosos e facilitando debugging em producao.

---

### 2.2 Estrutura de Hooks Customizados

**Situacao Atual:**
Logica de filtros duplicada em `produtos-view.tsx`, `estoque-view.tsx`, `movimentacoes-view.tsx`.

**Abordagem Alternativa:**
Hook generico de filtragem:
function useTableFilters<T>(data: T[], config: FilterConfig) {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() =>
    applyFilters(data, filters, search, config),
  [data, filters, search]);

  return { filteredData, filters, setFilters, search, setSearch };
}

**Ganho:**
- **Manutencao:** Corrigir bug de filtro em um unico lugar
- **Consistencia:** Comportamento identico em todas as views
- **DRY:** Reducao de ~200 linhas de codigo duplicado

---

### 2.4 Validacao de Formularios

**Situacao Atual:**
Validacao Zod apenas no submit, sem feedback visual por campo.

**Abordagem Alternativa:**
Integrar validacao com feedback em tempo real:
// Validacao async para SKU unico
const produtoSchema = z.object({
  sku: z.string()
    .min(3)
    .refine(async (sku) => {
      const exists = await checkSkuExists(sku);
      return !exists;
    }, 'SKU ja cadastrado'),
});

**Ganho:**
- **UX:** Usuario sabe imediatamente se SKU ja existe
- **Reducao de frustacao do cliente:** Menos erros no submit
- **Produtividade:** Cadastros mais rapidos

---

### 2.5 Configuracao de Cache do React Query

**Situacao Atual:**
QueryClient usa configuracoes default (staleTime: 0, refetch on window focus).

**Abordagem Alternativa:**
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30,   // 30 minutos
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

**Ganho:**
- **Performance:** Menos requisicoes redundantes
- **UX:** Navegacao entre abas instantanea
- **Custo:** Reducao de carga no servidor

---

### 2.6 Mensagens de Erro Estruturadas

**Situacao Atual:**
return NextResponse.json({ error: 'Falha ao buscar produtos' }, { status: 500 });

**Abordagem Alternativa:**
return NextResponse.json({
  error: {
    code: 'PRODUCT_FETCH_FAILED',
    message: 'Falha ao buscar produtos',
    timestamp: new Date().toISOString(),
    traceId: generateTraceId(),
  }
}, { status: 500 });

**Ganho:**
- **Debugging:** Rastreabilidade de erros em producao
- **Integracao:** Clientes podem tratar erros por codigo
- **Monitoramento:** Agregacao de erros por tipo

---

## 3. Sugestoes de Proximos Passos

#### 3.1 Implementar Testes Automatizados
**Escopo:** Services criticos, hooks, rotas API
**Stack sugerida:** Vitest + React Testing Library + MSW

**Testes prioritarios:**
- `estoqueMovimentacoes.service.ts` - validacao de estoque insuficiente
- `/api/estoque_movimentacoes` - fluxo completo de movimentacao
- `use-dashboard-metrics.ts` - calculos de metricas

**Impacto:** Previne regressoes, documenta comportamento esperado, aumenta confianca em deploys.

---

#### 3.2 Adicionar Autenticacao e Autorizacao
**Stack sugerida:** NextAuth.js v5

**Modelo de permissoes:**
| Role | Produtos | Estoque | Movimentacoes | Categorias |
|------|----------|---------|---------------|------------|
| Admin | CRUD | Read | CRUD | CRUD |
| Operador | Read | Read | Create | Read |
| Visualizador | Read | Read | Read | Read |

**Impacto:** Seguranca basica para producao..

---

#### 3.3 Logging e Monitoramento
**Stack sugerida:** Pino (logging) + Sentry (error tracking)

// middleware.ts
export function middleware(request: NextRequest) {
  logger.info({
    method: request.method,
    path: request.nextUrl.pathname,
    timestamp: Date.now(),
  });
}

**Impacto:** Visibilidade de erros em producao, metricas de uso, debugging facilitado.


#### 3.4 Relatorios e Exportacao
**Funcionalidades:**
- Exportar dados para CSV/Excel
- Relatorio de giro de estoque
- Historico de movimentacoes por periodo
- Alertas de estoque critico via email

**Valor para o cliente:** Integracao com sistemas contabeis que o cliente provavelmente tem a parte.

---

#### 3.5 Dashboard Avancado
**Melhorias:**
- Filtro de periodo customizavel (7d, 30d, 90d, custom)
- Grafico de tendencia de estoque por produto
- Top 10 produtos com maior giro
- Previsao de ruptura de estoque (ML simples)

**Valor:** Visao gerencial, antecipacao de problemas, otimizacao de compras.

---

#### 3.6 Notificacoes em Tempo Real
**Stack:** Server-Sent Events ou WebSockets

**Casos de uso:**
- Alerta quando estoque atinge nivel critico
- Notificacao de novas movimentacoes
- Sincronizacao entre multiplos usuarios

**Valor:** Resposta rapida a eventos criticos.


#### 3.7 API Publica com Documentacao
**Stack:** OpenAPI/Swagger + Rate Limiting

/api/v1/produtos:
  get:
    summary: Lista produtos com paginacao
    parameters:
      - name: page
      - name: limit
      - name: categoria
      - name: busca

**Valor:** Integracao fica facilitada com isso.

#### 3.8 Arquitetura para Multi-Tenant
**Modelo:** Schema por tenant ou Row-Level Security

model produtos {
  id         BigInt @id
  tenant_id  BigInt // Isolamento por empresa
  // ...
}

**Valor:** Dá para escalar para multiplas empresa,.


#### 3.9 Otimizacoes de Performance
**Implementacoes:**
- Indices compostos no PostgreSQL (`produto_id + tipo + criado_em`)
- Paginacao baseada em cursor (mais eficiente que offset)
- Cache Redis para queries frequentes
- CDN para assets estaticos

**Valor:** Suporte a uma escala de dados muito maior.

#### 3.10 Auditoria Completa
**Modelo:**
model audit_log {
  id         BigInt   @id
  user_id    BigInt
  action     String   // CREATE, UPDATE, DELETE
  entity     String   // produtos, estoque, movimentacoes
  entity_id  BigInt
  old_value  Json?
  new_value  Json?
  ip_address String
  timestamp  DateTime
}

**Valor:** Compliance e rastreabilidade.

#### 3.11 Integracao com Codigo de Barras/RFID
**Funcionalidades:**
- Leitura de codigo de barras via camera
- Integracao com leitores USB/Bluetooth

**Valor:** Para clientes isso faz muito sentido ao modelo de negócio que mexe com estoques físicos do que produtos digitais.

### 3.12 Melhorias de UX/UI

Atalhos de teclado onde `Ctrl+N` pode ser novo produto, `Ctrl+F` busca
Modo offline Service Worker + IndexedDB Operacao sem internet
Temas claro/escuro
Acessibilidade ARIA labels
Onboarding Tour guiado para novos usuarios
Bulk actions para Editar/excluir multiplos itens

---

Observações: Eu até pensei na implementação de muitas desses pontos de melhoria e proximos passos, porém, como o proprio teste deixa esse objetivo de reflexão, decidi por não implementar muito além, parando no sistema de idempotencia. Meus proximos passos diretos seriam aplicar o rate-limit e um tour guiado.