const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================= ENSURE UPLOAD FOLDER EXISTS ================= */
const uploadDir = "uploads";
const postsDir = path.join(uploadDir, "posts");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir);
}

/* ================= STORAGE ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

/* ================= FILE FILTER FOR POSTS (Images and Videos) ================= */
const postFileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const videoTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"];
  const allowedTypes = [...imageTypes, ...videoTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, GIF, WebP images and MP4, MPEG videos are allowed"), false);
  }
};

/* ================= MULTER FOR POSTS ================= */
const postUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB per file
  },
  fileFilter: postFileFilter
});

/* ================= DEFAULT FILE FILTER (Documents) ================= */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "video/mp4",
    "video/x-matroska",
    "video/quicktime",
    "video/avi",
    "video/x-msvideo"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, Word, and Video files are allowed"), false);
  }
};

/* ================= MULTER DEFAULT ================= */
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter
});

/* ================= ERROR HANDLER - SINGLE FILE ================= */
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

/* ================= ERROR HANDLER - POST MEDIA (Multiple) ================= */
const postMediaMiddleware = (req, res, next) => {
  const multiUpload = postUpload.array("files", 11); // Max 11 files (10 photos + 1 video)

  multiUpload(req, res, function (err) {
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

module.exports = {
  uploadMiddleware,
  postMediaMiddleware,
  postUpload
};