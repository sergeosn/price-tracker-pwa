import { isApiError } from "../api/errors";
import { notifyError } from "./notify";

export interface ConflictMapping {
  /** Form field that shows the 409 message. */
  field: string;
  message: string;
}

/** Field errors for a failed mutation, or null when the error is not about specific fields. */
export function formErrorsFromApiError(
  error: unknown,
  conflict?: ConflictMapping,
): Record<string, string> | null {
  if (!isApiError(error)) return null;
  if (error.kind === "conflict" && conflict) {
    return { [conflict.field]: conflict.message };
  }
  if (error.kind === "validation" && Object.keys(error.fieldErrors).length > 0) {
    return error.fieldErrors;
  }
  return null;
}

/** Puts field-level errors on the form; everything else becomes a toast. */
export function handleFormError(
  error: unknown,
  setErrors: (errors: Record<string, string>) => void,
  conflict?: ConflictMapping,
): void {
  const fieldErrors = formErrorsFromApiError(error, conflict);
  if (fieldErrors) {
    setErrors(fieldErrors);
  } else {
    notifyError(error);
  }
}
