// Erro base para todos os erros da aplicação
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Erro de validação (400)
export class ValidationError extends AppError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

// Recurso não encontrado (404)
export class NotFoundError extends AppError {
  public readonly resource: string;
  public readonly resourceId?: string;

  constructor(resource: string, resourceId?: string) {
    const message = resourceId
      ? `${resource} com ID ${resourceId} não encontrado(a)`
      : `${resource} não encontrado(a)`;
    super(message, 404, 'NOT_FOUND');
    this.resource = resource;
    this.resourceId = resourceId;
  }
}

// Violação de chave estrangeira (409)
export class ForeignKeyViolationError extends AppError {
  public readonly entity: string;
  public readonly relatedEntity: string;

  constructor(entity: string, relatedEntity: string) {
    const message = `Não é possível excluir ${entity} porque possui ${relatedEntity} associados. Exclua os ${relatedEntity} primeiro.`;
    super(message, 409, 'FK_VIOLATION');
    this.entity = entity;
    this.relatedEntity = relatedEntity;
  }
}

// Violação de constraint única (409)
export class UniqueConstraintError extends AppError {
  public readonly field: string;

  constructor(field: string, value?: string) {
    const message = value
      ? `Já existe um registro com ${field}: "${value}"`
      : `${field} já existe no sistema`;
    super(message, 409, 'UNIQUE_VIOLATION');
    this.field = field;
  }
}

// Erro de regra de negócio (400)
export class BusinessRuleError extends AppError {
  constructor(message: string, code: string = 'BUSINESS_RULE_ERROR') {
    super(message, 400, code);
  }
}

// Erro de estoque insuficiente (especializado)
export class EstoqueInsuficienteError extends BusinessRuleError {
  public readonly disponivel: number;
  public readonly solicitado: number;

  constructor(disponivel: number, solicitado: number) {
    super(
      `Estoque insuficiente. Disponível: ${disponivel} unidades. Solicitado: ${solicitado} unidades.`,
      'ESTOQUE_INSUFICIENTE'
    );
    this.disponivel = disponivel;
    this.solicitado = solicitado;
  }
}

// Erro de banco de dados genérico (500)
export class DatabaseError extends AppError {
  public readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

// Interface para erros Prisma
interface PrismaErrorMeta {
  target?: string[];
  field_name?: string;
  model_name?: string;
  constraint?: string;
}

interface PrismaError {
  code: string;
  meta?: PrismaErrorMeta;
  message?: string;
}

// Mapa de relações entre entidades
const ENTITY_RELATIONS: Record<string, string> = {
  categorias: 'produtos',
  produtos: 'movimentações de estoque',
};

// Traduções de campos para mensagens amigáveis
const FIELD_TRANSLATIONS: Record<string, string> = {
  sku: 'SKU',
  nome: 'Nome',
  email: 'E-mail',
  categoria_id: 'Categoria',
  produto_id: 'Produto',
};

// Tradutor de erros Prisma para erros da aplicação
export function translatePrismaError(
  error: unknown,
  context: { entity: string; operation: 'create' | 'update' | 'delete' }
): AppError {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return new DatabaseError(`Falha ao ${getOperationVerb(context.operation)} ${context.entity}`);
  }

  const prismaError = error as PrismaError;

  switch (prismaError.code) {
    // Unique constraint violation
    case 'P2002': {
      const field = prismaError.meta?.target?.[0] || 'campo';
      const translatedField = FIELD_TRANSLATIONS[field] || field;
      return new UniqueConstraintError(translatedField);
    }

    // Foreign key constraint violation (on delete/update)
    case 'P2003': {
      const relatedEntity = ENTITY_RELATIONS[context.entity] || 'registros relacionados';
      return new ForeignKeyViolationError(context.entity, relatedEntity);
    }

    // Record not found
    case 'P2025': {
      return new NotFoundError(capitalizeFirst(context.entity));
    }

    // Invalid value
    case 'P2006': {
      return new ValidationError('Valor inválido fornecido');
    }

    default:
      return new DatabaseError(
        `Falha ao ${getOperationVerb(context.operation)} ${context.entity}`,
        error
      );
  }
}

function getOperationVerb(operation: 'create' | 'update' | 'delete'): string {
  const verbs: Record<string, string> = {
    create: 'criar',
    update: 'atualizar',
    delete: 'excluir',
  };
  return verbs[operation];
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
