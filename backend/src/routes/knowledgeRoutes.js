const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadKnowledgeDocument,
  getAllKnowledgeDocuments,
  deleteKnowledgeDocument,
} = require("../controllers/knowledgeController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/knowledge"));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, and TXT files are allowed"));
    }
  },
});

router.post("/upload", upload.single("file"), uploadKnowledgeDocument);
router.get("/", getAllKnowledgeDocuments);
router.delete("/:id", deleteKnowledgeDocument);

module.exports = router;