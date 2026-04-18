const fs = require("fs");
const KnowledgeDocument = require("../models/KnowledgeDocument");
const KnowledgeChunk = require("../models/KnowledgeChunk");
const { extractTextFromFile } = require("../services/documentParserService");
const { splitTextIntoChunks } = require("../services/textChunkService");
const { generateEmbedding } = require("../services/embeddingService");

const uploadKnowledgeDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { title, category, uploadedBy } = req.body;

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    const extractedText = await extractTextFromFile(filePath, mimeType);

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from the uploaded file",
      });
    }

    const document = await KnowledgeDocument.create({
      title: title || req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType,
      category: category || "general",
      uploadedBy: uploadedBy || "admin",
      filePath,
      textLength: extractedText.length,
      chunkCount: 0,
    });

    const chunks = splitTextIntoChunks(extractedText, 1000, 200);

    const chunkDocs = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const embedding = await generateEmbedding(chunkText);

      chunkDocs.push({
        documentId: document._id,
        sourceTitle: document.title,
        chunkIndex: i,
        text: chunkText,
        embedding,
      });
    }

    if (chunkDocs.length) {
      await KnowledgeChunk.insertMany(chunkDocs);
    }

    document.chunkCount = chunkDocs.length;
    await document.save();

    return res.status(201).json({
      success: true,
      message: "Knowledge document uploaded and processed successfully",
      document,
      chunkCount: chunkDocs.length,
    });
  } catch (error) {
    console.error("Knowledge upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading knowledge document",
      error: error.message,
    });
  }
};

const getAllKnowledgeDocuments = async (req, res) => {
  try {
    const documents = await KnowledgeDocument.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Get knowledge documents error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching knowledge documents",
    });
  }
};

const deleteKnowledgeDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await KnowledgeDocument.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Knowledge document not found",
      });
    }

    await KnowledgeChunk.deleteMany({ documentId: document._id });

    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await KnowledgeDocument.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Knowledge document deleted successfully",
    });
  } catch (error) {
    console.error("Delete knowledge document error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting knowledge document",
    });
  }
};

module.exports = {
  uploadKnowledgeDocument,
  getAllKnowledgeDocuments,
  deleteKnowledgeDocument,
};