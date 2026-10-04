const API = import.meta.env.VITE_API_URL ?? "";

export async function api(path, options = {}, token = "") {
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  try {
    const res = await fetch(`${API}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("AI service rate limit reached. Please try again in a few moments.");
      }
      if (res.status === 503) {
        throw new Error("AI service is temporarily busy. Please try again.");
      }
      if (res.status === 500) {
        throw new Error(data.detail || "Something went wrong while processing your request.");
      }
      throw new Error(data.detail || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Unable to reach the Nyay AI server. Ensure backend is running.");
    }
    throw err;
  }
}