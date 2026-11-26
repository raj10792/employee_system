const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(payload.errors)
      ? payload.errors.join(", ")
      : payload.error || payload.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
}

export function employeeQuery({ search, status, page }) {
  const params = new URLSearchParams({ page: String(page), per_page: "20" });
  if (search.trim()) params.set("search", search.trim());
  if (status) params.set("employment_status", status);
  params.set("sort_by", "created_at");
  params.set("direction", "desc");
  return `?${params}`;
}
