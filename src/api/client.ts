import { ApiError } from "./errors";

/**
 * Client API unique de SmartCampus.
 * - Toutes les requêtes passent par l'API Gateway (VITE_API_BASE_URL).
 * - Intercepteur de requête : ajoute le JWT (Authorization: Bearer …).
 * - Intercepteur d'erreur : normalise les réponses (401/403/409/5xx) en ApiError.
 * - Mode mock (VITE_USE_MOCKS != "false") : la fonction `mock` fournie par chaque
 *   feature remplace l'appel réseau, avec une latence simulée.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

const TOKEN_KEY = "smartcampus.jwt";
export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch {
      /* stockage indisponible */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* stockage indisponible */
    }
  },
};

export interface RequestConfig {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ErrorInterceptor = (error: ApiError) => void;

const requestInterceptors: RequestInterceptor[] = [
  // Intercepteur JWT
  (config) => {
    const token = tokenStore.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
];
const errorInterceptors: ErrorInterceptor[] = [];

export const onRequest = (fn: RequestInterceptor) => void requestInterceptors.push(fn);
/** Ex. : rediriger vers la connexion sur 401. */
export const onError = (fn: ErrorInterceptor) => void errorInterceptors.push(fn);

export interface CallOptions<T> {
  body?: unknown;
  signal?: AbortSignal;
  /** Réponse fictive typée utilisée en mode mock. Peut lever une ApiError. */
  mock?: () => T | Promise<T>;
  /** Latence simulée (ms) en mode mock. */
  latency?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function request<T>(method: RequestConfig["method"], path: string, opts: CallOptions<T> = {}): Promise<T> {
  try {
    if (USE_MOCKS) {
      if (!opts.mock) throw new ApiError(404, `Aucun mock pour ${method} ${path}`);
      await sleep(opts.latency ?? 350 + Math.random() * 250);
      if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");
      return await opts.mock();
    }

    let config: RequestConfig = {
      method,
      url: `${API_BASE_URL}${path}`,
      headers: { Accept: "application/json", ...(opts.body ? { "Content-Type": "application/json" } : {}) },
      body: opts.body,
      signal: opts.signal,
    };
    for (const intercept of requestInterceptors) config = await intercept(config);

    let res: Response;
    try {
      res = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: config.signal,
      });
    } catch (e) {
      if ((e as Error).name === "AbortError") throw e;
      throw new ApiError(0, "Impossible de joindre l'API Gateway");
    }
    if (!res.ok) {
      const details = await res.json().catch(() => undefined);
      throw new ApiError(res.status, (details as { message?: string } | undefined)?.message ?? res.statusText, details);
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  } catch (e) {
    if (e instanceof ApiError) errorInterceptors.forEach((fn) => fn(e));
    throw e;
  }
}

export const api = {
  get: <T>(path: string, opts?: CallOptions<T>) => request<T>("GET", path, opts),
  post: <T>(path: string, opts?: CallOptions<T>) => request<T>("POST", path, opts),
  put: <T>(path: string, opts?: CallOptions<T>) => request<T>("PUT", path, opts),
  patch: <T>(path: string, opts?: CallOptions<T>) => request<T>("PATCH", path, opts),
  delete: <T>(path: string, opts?: CallOptions<T>) => request<T>("DELETE", path, opts),
};
