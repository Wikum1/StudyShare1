const jwt = require("jsonwebtoken");

/* ==============================
   PROTECT ROUTES (AUTH CHECK)
============================== */
exports.protect = (req, res, next) => {
  try {
    let token;
    console.log("🔐 Auth middleware - checking token");
    console.log("Headers:", Object.keys(req.headers));
    console.log("Authorization header:", req.headers.authorization?.substring(0, 20) + "...");

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log("✅ Token found in Authorization header");
    }

    if (!token) {
      console.log("❌ No token found");
      return res.status(401).json({
        message: "Not authorized, no token"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    console.log("✅ Token verified, user ID:", decoded.id);

    // Attach user data to request
    req.user = decoded;

    next();

  } catch (err) {
    console.error("❌ Auth error:", err.message);
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};


/* ==============================
   ADMIN ONLY ACCESS
============================== */
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access only"
    });
  }

  next();
};