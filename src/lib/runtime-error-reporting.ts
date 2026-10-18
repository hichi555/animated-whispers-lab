type RuntimeErrorContext = Record<string, unknown>;

export function reportRuntimeError(error: unknown, context: RuntimeErrorContext = {}) {
  const normalized = error instanceof Error ? error : new Error(String(error));
  console.error("[CyliaTales] runtime error", { error: normalized, ...context });
}
