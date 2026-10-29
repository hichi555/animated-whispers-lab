const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function safeHttpOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : null;
  } catch {
    return null;
  }
}

export function resolveOAuthCallbackOrigin(
  currentOrigin: string,
  configuredOrigin?: string,
): string {
  const current = safeHttpOrigin(currentOrigin);
  const configured = safeHttpOrigin(configuredOrigin);
  const currentHost = current ? new URL(current).hostname : "";
  if (current && LOOPBACK_HOSTS.has(currentHost) && configured) return configured;
  return current ?? configured ?? "";
}

export function shouldHandoffOAuth(currentOrigin: string, callbackOrigin: string): boolean {
  const current = safeHttpOrigin(currentOrigin);
  const callback = safeHttpOrigin(callbackOrigin);
  if (!current || !callback || current === callback) return false;
  return LOOPBACK_HOSTS.has(new URL(current).hostname);
}

export function safeInternalReturnTo(value: unknown, fallback = "/studio"): string {
  if (typeof value !== "string") return fallback;
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
  try {
    const destination = new URL(path, "https://cylia.invalid");
    return destination.origin === "https://cylia.invalid" ? path : fallback;
  } catch {
    return fallback;
  }
}
