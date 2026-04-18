const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const extractTextFromFile = async (filePath, mimeType) => {
  if (mimeType === "application/pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }

  if (mimeType === "text/plain") {
    return fs.readFileSync(filePath, "utf8");
  }

  throw new Error("Unsupported file type. Only PDF, DOCX, and TXT are allowed.");
};

module.exports = { extractTextFromFile };