/**
 * Cliente HTTP estándar para todas las llamadas a API.
 * En desarrollo usa el proxy de Vite (/api) para evitar CORS.
 * En producción usa VITE_API_URL o la URL por defecto del backend.
 */
const PRODUCTION_BASE_URL = (import.meta.env.VITE_API_URL || 'http://144.91.79.105:9091').replace(/\/$/, '');
const BASE_URL = import.meta.env.DEV ? '/api' : PRODUCTION_BASE_URL;

/**
 * Obtiene el token de autenticación (Bearer).
 * Primero intenta user.token en localStorage 'fit-house-user', luego 'fit-house-token'.
 */
function getAuthToken() {
  try {
    const stored = localStorage.getItem('fit-house-user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.token) return user.token;
    }
  } catch (_) {}
  return localStorage.getItem('fit-house-token') || null;
}

/**
 * Construye las cabeceras por defecto (Content-Type, Authorization).
 * @param {HeadersInit} [customHeaders] - Cabeceras adicionales o que sobrescriben las por defecto
 */
function buildHeaders(customHeaders = {}) {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };
}

/**
 * Parsea la respuesta de error (JSON o texto).
 */
async function parseErrorResponse(response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (_) {}
  }
  const text = await response.text();
  return text ? { message: text } : { message: response.statusText };
}

/**
 * Lanza un error estándar con status, message y data.
 */
function throwHttpError(response, data) {
  const message =
    data?.message ?? data?.error ?? data?.msg ?? response.statusText ?? 'Error en la solicitud';
  const err = new Error(message);
  err.status = response.status;
  err.data = data;
  err.response = response;
  throw err;
}

/**
 * Realiza una petición HTTP.
 * @param {string} endpoint - Ruta (ej: '/users') o URL absoluta
 * @param {RequestInit & { body?: object }} options - method, body (objeto, se serializa a JSON), headers, etc.
 * @returns {Promise<object|string>} - Cuerpo parseado (JSON) o texto
 */
async function request(endpoint, options = {}) {
  const { body, headers: customHeaders, ...fetchOptions } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const headers = buildHeaders(customHeaders);

  const config = {
    ...fetchOptions,
    headers,
    body:
      body !== undefined && body !== null && typeof body === 'object' && !(body instanceof FormData)
        ? JSON.stringify(body)
        : body,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const data = await parseErrorResponse(response);
    throwHttpError(response, data);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

/**
 * Cliente HTTP con métodos estándar para usar en todos los servicios.
 */
export const http = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PUT', body }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body }),

  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Para peticiones con body opcional (ej: POST sin body).
 */
export { request };

export default http;
