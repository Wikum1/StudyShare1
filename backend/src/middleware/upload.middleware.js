const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================= ENSURE UPLOAD FOLDER EXISTS ================= */
const uploadDir = "uploads";
const postsDir = path.join(uploadDir, "posts");
const profileDir = path.join(uploadDir, "profiles");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir);
}

if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir);
}

/* ================= STORAGE FOR POSTS ================= */
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

/* ================= STORAGE FOR PROFILE PICTURES ================= */
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || "unknown";
    const ext = path.extname(file.originalname);
    const filename = `${userId}-${Date.now()}${ext}`;
    cb(null, filename);
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

/* ================= FILE FILTER FOR PROFILE PICTURES ================= */
const profilePictureFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed for profile pictures"), false);
  }
};

/* ================= MULTER FOR PROFILE PICTURES ================= */
const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max for profile pictures
  },
  fileFilter: profilePictureFilter
});

/* ================= ERROR HANDLER - PROFILE PICTURE UPLOAD ================= */
const profilePictureMiddleware = (req, res, next) => {
  console.log("📤 Profile picture middleware - processing upload");
  console.log("Content-Type:", req.headers["content-type"]);
  
  const singleUpload = profileUpload.single("profilePicture");

  singleUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("❌ Multer error:", err.message);
      return res.status(400).json({
        message: "Profile picture upload error: " + err.message
      });
    } else if (err) {
      console.error("❌ Upload error:", err.message);
      return res.status(400).json({
        message: err.message
      });
    }

    console.log("✅ File uploaded:", req.file?.filename);
    next();
  });
};

module.exports = {
  uploadMiddleware,
  postMediaMiddleware,
  postUpload,
  profilePictureMiddleware
};