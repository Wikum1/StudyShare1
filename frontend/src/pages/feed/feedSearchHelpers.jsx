import React from "react";

export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function filterPostsByQuery(posts, qRaw, scope, userId) {
  const q = (qRaw || "").trim().toLowerCase();
  let list = Array.isArray(posts) ? [...posts] : [];

  if (scope === "myPosts") {
    list = userId ? list.filter((p) => (p.author || "").toString() === userId) : [];
  } else if (scope === "savedPosts") {
    list = list.filter((p) => Boolean(p.savedByMe));
  }

  if (!q) return list;

  return list.filter((post) => {
    const topic = (post.topic || "").toLowerCase();
    const content = (post.content || "").toLowerCase();
    const author = (post.authorName || "").toLowerCase();
    const inComments = (post.comments || []).some((c) =>
      (c.content || "").toLowerCase().includes(q)
    );
    return (
      topic.includes(q) ||
      content.includes(q) ||
      author.includes(q) ||
      inComments
    );
  });
}

function buildHighlightNodes(text, query) {
  const t = text == null ? "" : String(text);
  const raw = (query || "").trim();
  if (!raw) return [t];

  const terms = [...new Set(raw.split(/\s+/).filter(Boolean))];
  if (!terms.length) return [t];

  const re = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const out = [];
  let last = 0;
  const r = new RegExp(re.source, "gi");
  let m;
  let key = 0;

  while ((m = r.exec(t)) !== null) {
    if (m.index > last) out.push(t.slice(last, m.index));
    out.push(
      React.createElement("mark", { className: "feedSearchHighlight", key: `h-${key++}` }, m[0])
    );
    last = m.index + m[0].length;
  }
  if (last < t.length) out.push(t.slice(last));
  return out.length ? out : [t];
}

export function HighlightedText({ text, query, className, as: Tag = "span", ...rest }) {
  const raw = (query || "").trim();
  const t = text == null ? "" : String(text);
  const children = !raw ? t : buildHighlightNodes(t, raw);
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  );
}
