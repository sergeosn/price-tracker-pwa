export type ApiErrorKind =
  "network" | "unauthorized" | "not_found" | "conflict" | "validation" | "server" | "unexpected";

export const NETWORK_ERROR_MESSAGE = "Can't reach the server. Check the API URL in Settings.";

/** Every failed API call is turned into an ApiError, so the UI handles one shape. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  /** Field name → message. Filled only for 422 responses with body field errors. */
  readonly fieldErrors: Record<string, string>;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number; fieldErrors?: Record<string, string>; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = options.status;
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** `fetch` itself failed: server down, wrong URL, or blocked by CORS. */
export function networkError(cause: unknown): ApiError {
  return new ApiError("network", NETWORK_ERROR_MESSAGE, { cause });
}

export function apiErrorFromResponse(status: number, body: unknown): ApiError {
  const detail = readDetail(body);
  if (status === 401) {
    return new ApiError("unauthorized", "Invalid API key", { status });
  }
  if (status === 404) {
    return new ApiError("not_found", typeof detail === "string" ? detail : "Not found", { status });
  }
  if (status === 409) {
    return new ApiError("conflict", typeof detail === "string" ? detail : "Already exists", {
      status,
    });
  }
  if (status === 422) {
    return new ApiError("validation", "Some fields are invalid", {
      status,
      fieldErrors: readFieldErrors(detail),
    });
  }
  if (status >= 500) {
    return new ApiError("server", `Server error (${status}). Try again later.`, { status });
  }
  return new ApiError("unexpected", `Unexpected response (${status})`, { status });
}

function readDetail(body: unknown): unknown {
  return typeof body === "object" && body !== null && "detail" in body ? body.detail : undefined;
}

/** FastAPI 422 detail: [{ loc: ["body", "url"], msg: "..." }] → { url: "..." }. */
function readFieldErrors(detail: unknown): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!Array.isArray(detail)) {
    return errors;
  }
  for (const item of detail as unknown[]) {
    if (typeof item !== "object" || item === null) continue;
    const { loc, msg } = item as { loc?: unknown; msg?: unknown };
    if (!Array.isArray(loc) || loc[0] !== "body" || typeof msg !== "string") continue;
    const field = loc[1];
    if (typeof field === "string" && !(field in errors)) {
      errors[field] = msg;
    }
  }
  return errors;
}
