const KnowledgeChunk = require("../models/KnowledgeChunk");

const normalizeText = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const detectModule = (query) => {
  const q = normalizeText(query);

  if (q.includes("paf")) return "paf";
  if (q.includes("ds")) return "ds";
  if (q.includes("ndm")) return "ndm";
  if (q.includes("itpm")) return "itpm";

  return null;
};

const searchRelevantChunks = async (query, limit = 5) => {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  const detectedModule = detectModule(query);

  const chunks = await KnowledgeChunk.find().lean();

  const scoredChunks = chunks.map((chunk) => {
    const chunkText = normalizeText(chunk.text);
    const sourceTitle = normalizeText(chunk.sourceTitle || "");
    let score = 0;

    // Module-based boost
    if (detectedModule && sourceTitle.includes(detectedModule)) {
      score += 15;
    }

    // Full query match in chunk text
    if (chunkText.includes(normalizedQuery)) {
      score += 12;
    }

    // Full query match in source title
    if (sourceTitle.includes(normalizedQuery)) {
      score += 10;
    }

    // Word-based scoring
    queryWords.forEach((word) => {
      if (chunkText.includes(word)) score += 2;
      if (sourceTitle.includes(word)) score += 3;
    });

    // Extra boost for important academic terms
    const importantWords = queryWords.filter((word) => word.length > 2);
    importantWords.forEach((word) => {
      if (chunkText.includes(word)) score += 1;
    });

    return {
      ...chunk,
      score,
    };
  });

  return scoredChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

module.exports = { searchRelevantChunks };