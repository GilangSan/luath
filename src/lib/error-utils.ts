import { ApiError } from './api';

// Check if error is ApiError
export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

// Get display-ready error info from any thrown value
export interface ErrorDisplay {
  title: string;       // short label, ALL CAPS for terminal aesthetic
  message: string;     // full user-facing message
  code: string;        // error code for logging/debugging
  retryable: boolean;  // should UI show a retry button?
}

export function parseError(err: unknown): ErrorDisplay {
  if (err instanceof ApiError) {
    return {
      title: getTitleForCode(err.errorCode),
      message: err.message,
      code: err.errorCode,
      retryable: isRetryable(err.statusCode, err.errorCode)
    };
  }
  // Unknown error
  return {
    title: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    code: 'unknown',
    retryable: true
  };
}

function getTitleForCode(code: string): string {
  const map: Record<string, string> = {
    video_unavailable:     'VIDEO_UNAVAILABLE',
    video_private:         'ACCESS_DENIED',
    members_only:          'MEMBERS_ONLY',
    age_restricted:        'AGE_RESTRICTED',
    not_yet_available:     'NOT_YET_AVAILABLE',
    content_removed:       'CONTENT_REMOVED',
    auth_required:         'AUTH_REQUIRED',
    cookies_required:      'AUTH_REQUIRED',
    geo_restricted:        'GEO_RESTRICTED',
    unsupported_url:       'UNSUPPORTED_URL',
    extraction_failed:     'EXTRACTION_FAILED',
    network_error:         'NETWORK_ERROR',
    platform_rate_limited: 'PLATFORM_RATE_LIMITED',
    platform_forbidden:    'ACCESS_DENIED',
    not_found:             'NOT_FOUND',
    rate_limit_exceeded:   'RATE_LIMIT_EXCEEDED',
    validation_error:      'INVALID_INPUT',
    job_not_found:         'JOB_EXPIRED',
    download_error:        'DOWNLOAD_FAILED',
    internal_error:        'SERVER_ERROR',
    file_too_large:        'FILE_TOO_LARGE',
  };
  return map[code] ?? 'ERROR';
}

function isRetryable(status: number, code: string): boolean {
  // Not retryable — user needs to take action or URL is invalid
  const nonRetryable = [
    'video_private',
    'members_only',
    'age_restricted',
    'auth_required',
    'cookies_required',
    'geo_restricted',
    'unsupported_url',
    'video_unavailable',
    'content_removed',
    'file_too_large',
  ];
  if (nonRetryable.includes(code)) return false;

  // Retryable — transient errors
  return [0, 429, 500, 503].includes(status) ||
    ['network_error', 'platform_rate_limited', 
     'extraction_failed', 'download_error'].includes(code);
}
