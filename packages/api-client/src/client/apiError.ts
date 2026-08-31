export type ApiError = {
  code: string;
  message: string;
  status: number;
};

export class ApiRequestError extends Error {
  constructor(readonly detail: ApiError) {
    super(detail.message);
    this.name = "ApiRequestError";
  }
}

export async function toApiError(response: Response): Promise<ApiError> {
  const fallback = {
    code: "UNKNOWN",
    message: "요청을 처리하지 못했습니다.",
    status: response.status,
  };

  try {
    const body = (await response.json()) as Partial<ApiError> & { message?: string | string[] };

    return {
      code: body.code ?? fallback.code,
      message: Array.isArray(body.message) ? body.message.join("\n") : (body.message ?? fallback.message),
      status: response.status,
    };
  } catch {
    return fallback;
  }
}
