export function normalizeGithub(url) {
  if (!url) return "";
  return url.trim().toLowerCase().replace(/\/+$/g, "");
}