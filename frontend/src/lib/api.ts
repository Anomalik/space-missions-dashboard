const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchApi<T>(
  endpoint: string,
  params?: Record<string, string | number | null | undefined>
): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
