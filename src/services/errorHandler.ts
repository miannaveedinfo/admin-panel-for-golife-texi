/**
 * GoLife Taxi Pakistan - Centralized Error Handler & Quota Protection
 * 
 * Protects against:
 * 1. Quota exceeded loops (resource-exhausted / 429)
 * 2. Uncontrolled automated retries
 * 3. Raw technical error exposure in the UI
 * 4. Graceful fallback to Demo Mode when services are unavailable
 */

export type ErrorCategory =
  | 'quota_exceeded'
  | 'permission_denied'
  | 'network_unavailable'
  | 'firebase_unavailable'
  | 'auth_expired'
  | 'missing_config'
  | 'invalid_query'
  | 'timeout'
  | 'unknown';

export interface ClassifiedError {
  category: ErrorCategory;
  userMessage: string;
  technicalMessage?: string;
  isRecoverable: boolean;
  timestamp: string;
}

// Global Circuit Breaker for Quota Protection
let quotaExceededState = false;
let quotaExceededMessage: string | null = null;
const errorListeners: Set<(error: ClassifiedError) => void> = new Set();
const quotaListeners: Set<(isExceeded: boolean, message: string | null) => void> = new Set();

export function isQuotaExceeded(): boolean {
  return quotaExceededState;
}

export function getQuotaExceededMessage(): string | null {
  return quotaExceededMessage;
}

export function setQuotaExceeded(exceeded: boolean, message: string | null = null): void {
  quotaExceededState = exceeded;
  quotaExceededMessage = message;
  quotaListeners.forEach((listener) => {
    try {
      listener(exceeded, message);
    } catch (e) {
      console.error('Error in quota listener:', e);
    }
  });
}

export function subscribeToQuotaChanges(callback: (isExceeded: boolean, message: string | null) => void): () => void {
  quotaListeners.add(callback);
  return () => {
    quotaListeners.delete(callback);
  };
}

export function subscribeToErrors(callback: (error: ClassifiedError) => void): () => void {
  errorListeners.add(callback);
  return () => {
    errorListeners.delete(callback);
  };
}

export function classifyError(error: unknown): ClassifiedError {
  const rawMsg = error instanceof Error ? error.message : String(error);
  const lower = rawMsg.toLowerCase();
  const now = new Date().toISOString();

  // 1. Quota Exceeded / Resource Exhausted
  if (
    lower.includes('quota') ||
    lower.includes('resource-exhausted') ||
    lower.includes('429') ||
    lower.includes('too many requests') ||
    lower.includes('quota exceeded')
  ) {
    setQuotaExceeded(true, 'Service rate limit temporarily reached. Please retry shortly.');
    return {
      category: 'quota_exceeded',
      userMessage: 'Service request limit temporarily reached. Please retry shortly.',
      technicalMessage: rawMsg,
      isRecoverable: false,
      timestamp: now
    };
  }

  // 2. Permission Denied
  if (lower.includes('permission-denied') || lower.includes('insufficient permissions') || lower.includes('403')) {
    return {
      category: 'permission_denied',
      userMessage: 'Access restricted by administrative security rules.',
      technicalMessage: rawMsg,
      isRecoverable: false,
      timestamp: now
    };
  }

  // 3. Network Unavailable / Offline
  if (
    lower.includes('offline') ||
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('client is offline')
  ) {
    return {
      category: 'network_unavailable',
      userMessage: 'Network connectivity issue. Please check your connection and retry.',
      technicalMessage: rawMsg,
      isRecoverable: true,
      timestamp: now
    };
  }

  // 4. Firebase Unavailable
  if (lower.includes('unavailable') || lower.includes('service unavailable') || lower.includes('503')) {
    return {
      category: 'firebase_unavailable',
      userMessage: 'Cloud service is temporarily unavailable. Please retry.',
      technicalMessage: rawMsg,
      isRecoverable: true,
      timestamp: now
    };
  }

  // 5. Auth Expired
  if (lower.includes('unauthenticated') || lower.includes('auth/id-token-expired') || lower.includes('token expired')) {
    return {
      category: 'auth_expired',
      userMessage: 'Admin session has expired. Please sign in again.',
      technicalMessage: rawMsg,
      isRecoverable: true,
      timestamp: now
    };
  }

  // 6. Missing Config
  if (lower.includes('missing') && (lower.includes('config') || lower.includes('api key') || lower.includes('project id'))) {
    return {
      category: 'missing_config',
      userMessage: 'Backend configuration pending or unavailable.',
      technicalMessage: rawMsg,
      isRecoverable: false,
      timestamp: now
    };
  }

  // 7. Invalid Query
  if (lower.includes('invalid-argument') || lower.includes('failed-precondition') || lower.includes('requires an index')) {
    return {
      category: 'invalid_query',
      userMessage: 'Query parameters could not be processed by backend index.',
      technicalMessage: rawMsg,
      isRecoverable: false,
      timestamp: now
    };
  }

  // 8. Timeout
  if (lower.includes('deadline-exceeded') || lower.includes('timeout')) {
    return {
      category: 'timeout',
      userMessage: 'Request took too long to complete. Please try again.',
      technicalMessage: rawMsg,
      isRecoverable: true,
      timestamp: now
    };
  }

  // 9. Unknown
  return {
    category: 'unknown',
    userMessage: 'An unexpected operational error occurred. Please retry.',
    technicalMessage: rawMsg,
    isRecoverable: false,
    timestamp: now
  };
}

/**
 * Executes an async task with limited, non-infinite retries.
 * If quota error is hit, retries stop IMMEDIATELY.
 */
export async function withSafeRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delayMs?: number; taskName?: string } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 2;
  const delayMs = options.delayMs ?? 600;

  if (isQuotaExceeded()) {
    throw new Error('Operation aborted: Quota protection circuit is active.');
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err) {
      const classified = classifyError(err);
      errorListeners.forEach((l) => {
        try { l(classified); } catch {}
      });

      // Stop immediately on quota exceeded or non-recoverable errors
      if (classified.category === 'quota_exceeded' || !classified.isRecoverable || attempt === maxRetries) {
        throw err;
      }

      attempt++;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw new Error('Exceeded safe retry threshold.');
}
