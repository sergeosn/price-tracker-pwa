import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { isApiError } from "../api/errors";
import { notifyUnauthorized } from "../shared/notify";

const MAX_RETRIES = 2;

/** Retry only failures that may go away by themselves: network errors and 5xx. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) {
    return false;
  }
  return isApiError(error) && (error.kind === "network" || error.kind === "server");
}

function handleGlobalError(error: unknown): void {
  if (isApiError(error) && error.kind === "unauthorized") {
    notifyUnauthorized();
  }
}

export function createQueryClient({ retry = true }: { retry?: boolean } = {}): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleGlobalError }),
    mutationCache: new MutationCache({ onError: handleGlobalError }),
    defaultOptions: {
      queries: { retry: retry ? shouldRetry : false },
      mutations: { retry: false },
    },
  });
}
