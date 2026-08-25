import 'server-only';

// Without this, a provider call that hangs (rather than erroring quickly)
// runs until Vercel's own hard function-duration cap kills the whole
// request — which returns a plain-text platform timeout page, not JSON,
// so the client's res.json() throws and the user just sees a generic
// "Network error." Failing fast here lets the route's own try/catch
// return a proper, informative JSON error well before that happens.
const AI_PROVIDER_TIMEOUT_MS = 40_000;

export async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_PROVIDER_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`AI provider request timed out after ${AI_PROVIDER_TIMEOUT_MS / 1000}s.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
