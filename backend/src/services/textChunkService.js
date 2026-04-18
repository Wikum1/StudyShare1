const splitTextIntoChunks = (text, chunkSize = 2000, overlap = 400) => {
  const cleanedText = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedText) return [];

  const chunks = [];
  let start = 0;

  while (start < cleanedText.length) {
    const end = Math.min(start + chunkSize, cleanedText.length);
    const chunk = cleanedText.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end === cleanedText.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
};

module.exports = { splitTextIntoChunks };