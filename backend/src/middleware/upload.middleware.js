const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================= ENSURE UPLOAD FOLDER EXISTS ================= */
const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* ================= STORAGE ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

/* ================= FILE FILTER ================= */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "video/mp4",
    "video/x-matroska",
    "video/quicktime",
    "video/avi",           // 🔥 added
    "video/x-msvideo"      // 🔥 added
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, Word, and Video files are allowed"), false);
  }
};

/* ================= MULTER ================= */
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter
});

/* ================= ERROR HANDLER ================= */
const uploadMiddleware = (req, res, next) => {
  const singleUpload = upload.single("file");

  singleUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message: "File upload error: " + err.message
      });
    } else if (err) {
      return res.status(400).json({
        message: err.message
      });
    }

    next();
  });
};

module.exports = uploadMiddleware;