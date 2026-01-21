# Reflexao Tecnica - Desafio FullStack Plansul

**Candidato:** Rafael de Souza Almeida
**Data:** 21/01/2026

---

## 1. O que voce fez?

### Parte 1: Debugging do Backend

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