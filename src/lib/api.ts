import { ExtractResponse, JobStatusResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    public message: string,
    public field?: string,
    public isPlatformError?: boolean
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;

  // Try to parse backend error shape
  let body: any = {};
  try {
    body = await res.json();
  } catch {
    // Fallback if not JSON
  }

  // Handle FastAPI's "detail" wrapping
  const errorData = body.detail && typeof body.detail === 'object' 
    ? body.detail 
    : body;

  throw new ApiError(
    res.status,
    typeof errorData.error === 'string' ? errorData.error : 'unknown_error',
    typeof errorData.message === 'string'
      ? errorData.message
      : getDefaultMessage(res.status),
    typeof errorData.field === 'string' ? errorData.field : undefined,
    typeof errorData.platform_error === 'boolean'
      ? errorData.platform_error
      : undefined
  );
}

function getDefaultMessage(status: number): string {
  const map: Record<number, string> = {
    400: 'Invalid request. Please check the URL and try again.',
    401: 'Authentication required.',
    403: 'Access denied.',
    404: 'Resource not found.',
    422: 'Invalid input provided.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Please try again later.',
    503: 'Service temporarily unavailable. Please try again.'
  };
  return map[status] ?? 'An unexpected error occurred.';
}

export async function extractVideo(url: string): Promise<ExtractResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    return handleResponse<ExtractResponse>(response);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      0,
      'network_error',
      'Cannot reach the server. Please check your connection.'
    );
  }
}

export async function startDownload(
  url: string,
  stream_id: string,
  filename?: string
): Promise<{ job_id: string; status: "queued" }> {
  try {
    const response = await fetch(`${BASE_URL}/api/download/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, stream_id, filename }),
    });
    return handleResponse<{ job_id: string; status: "queued" }>(response);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      0,
      'network_error',
      'Cannot reach the server. Please check your connection.'
    );
  }
}

export async function getJobStatus(job_id: string): Promise<JobStatusResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/download/status/${job_id}`);
    return handleResponse<JobStatusResponse>(response);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      0,
      'network_error',
      'Cannot reach the server. Please check your connection.'
    );
  }
}

export function getFileUrl(job_id: string): string {
  return `${BASE_URL}/api/download/file/${job_id}`;
}
