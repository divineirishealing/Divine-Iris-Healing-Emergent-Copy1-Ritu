const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Resolves an image URL. If it's a relative path (starts with /api/image/),
 * prepends the backend URL. Otherwise returns as-is.
 */
export function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('/api/image/')) {
    return `${BACKEND_URL}${url}`;
  }
  return url;
}
