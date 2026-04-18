const generateEmbedding = async (text) => {
  // Temporary placeholder embedding
  // Later you will replace this with a real embedding API
  const safeText = String(text || "");
  return [safeText.length % 1000, safeText.split(" ").length % 1000];
};

module.exports = { generateEmbedding };