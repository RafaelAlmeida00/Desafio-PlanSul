// Tipo para resposta de erro da API
export interface ApiErrorResponse {
  error: string;
  code: string;
}

// Erro customizado para o frontend
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(response: ApiErrorResponse, statusCode: number) {
    super(response.error);
    this.name = 'ApiError';
    this.code = response.code;
    this.statusCode = statusCode;
  }
}

// Helper para extrair erro da resposta
export async function handleFetchError(response: Response): Promise<never> {
  const errorData: ApiErrorResponse = await response.json();
  throw new ApiError(errorData, response.status);
}
