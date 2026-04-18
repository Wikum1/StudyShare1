const { searchRelevantChunks } = require("./vectorSearchService");

const cleanAnswer = (text, question) => {
  if (!text) return "";

  // Remove common slide artifacts and weird symbols
  let cleaned = String(text)
    .replace(/[□▪•▶◆■◦●]/g, " ")
    .replace(/THANK YOU/gi, " ")
    .replace(/LEARNING OUTCOMES/gi, " ")
    .replace(/CONTENTS/gi, " ")
    .replace(/SUMMARY/gi, " ")
    .replace(/REFERENCES/gi, " ")
    .replace(/Source:\s*https?:\/\/\S+/gi, " ")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Split into smaller units
  const sentences = cleaned
    .split(/(?<=[.?!])\s+|\s{2,}/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 25);

  if (!sentences.length) return cleaned;

  const keywords = String(question || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const stopWords = new Set([
    "what",
    "which",
    "when",
    "where",
    "why",
    "how",
    "does",
    "about",
    "this",
    "that",
    "with",
    "from",
    "into",
    "your",
    "their",
    "have",
    "will",
    "would",
    "should",
    "could",
    "there",
    "module",
    "lecture",
  ]);

  const usefulKeywords = keywords.filter((word) => !stopWords.has(word));

  const scoredSentences = sentences.map((sentence) => {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;

    usefulKeywords.forEach((word) => {
      if (lowerSentence.includes(word)) {
        score += 3;
      }
    });

    // Prefer definitional sentences for "what is" questions
    if (
      question.toLowerCase().startsWith("what is") ||
      question.toLowerCase().startsWith("what are")
    ) {
      if (
        lowerSentence.includes(" is ") ||
        lowerSentence.includes(" are ") ||
        lowerSentence.startsWith("software engineering") ||
        lowerSentence.startsWith("a framework") ||
        lowerSentence.startsWith("rest") ||
        lowerSentence.startsWith("git")
      ) {
        score += 4;
      }
    }

    // Penalize noisy slide leftovers
    if (
      lowerSentence.includes("module outline") ||
      lowerSentence.includes("assessment") ||
      lowerSentence.includes("next week") ||
      lowerSentence.includes("thank you") ||
      lowerSentence.includes("contents")
    ) {
      score -= 4;
    }

    return { sentence, score };
  });

  const matchedSentences = scoredSentences
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.sentence);

  let finalText = "";

  if (matchedSentences.length > 0) {
    finalText = matchedSentences.join(" ");
  } else {
    finalText = sentences.slice(0, 2).join(" ");
  }

  // Final cleanup
  finalText = finalText
    .replace(/\s+/g, " ")
    .replace(/\b(Module Outline|Contents|Summary|References)\b/gi, "")
    .trim();

  if (finalText.length > 280) {
    finalText = finalText.slice(0, 280).trim() + "...";
  }

  return finalText;
};

const answerQuestionFromKnowledgeBase = async (question) => {
  const relevantChunks = await searchRelevantChunks(question, 5);

  if (!relevantChunks.length) {
    return {
      answer:
        "Sorry, I could not find a reliable answer in the academic knowledge base. Please check official university documents or ask your lecturer.",
      sources: [],
    };
  }

  const bestChunk = relevantChunks[0];
  const answer = cleanAnswer(bestChunk.text, question);

  const sources = [...new Set(relevantChunks.map((chunk) => chunk.sourceTitle))];

  return {
    answer,
    sources,
  };
};

module.exports = { answerQuestionFromKnowledgeBase };