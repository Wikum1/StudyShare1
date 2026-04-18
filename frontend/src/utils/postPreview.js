/** Short preview for posts (content preferred; falls back to legacy title). */
export function postPreviewText(post, maxLen = 80) {
  const raw = (post?.content ?? post?.title ?? "").trim();
  if (!raw) return "";
  if (raw.length <= maxLen) return raw;
  return `${raw.slice(0, maxLen).trimEnd()}…`;
}
