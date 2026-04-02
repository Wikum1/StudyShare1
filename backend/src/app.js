require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const resourceRoutes = require("./routes/resource.routes");
const adminResourceRoutes = require("./routes/admin/adminResource.routes");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/auth.routes");
const studyPlanRoutes = require("./routes/studyPlan.routes");
const reminderRoutes = require("./routes/reminder.routes");
const postRoutes = require("./routes/post.routes");
const reactionRoutes = require("./routes/reaction.routes");
const userRoutes = require("./routes/user.routes");
const reminderScheduler = require("./services/reminderScheduler");

const app = express();

app.use(cors());
app.use(express.json());

// DEBUG: Log all incoming requests
app.use((req, res, next) => {
  console.log(`\n📡 ${req.method} ${req.path}`);
  console.log(`   URL: ${req.originalUrl}`);
  console.log(`   Body:`, req.body || "none");
  console.log(`   Headers:`, { authorization: req.headers.authorization ? "Bearer..." : "none" });
  next();
});

/* serve uploaded files */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://student1:8g81fbYGlA0mndvi@cluster0.ux2zfme.mongodb.net/?appName=Cluster0"
  )
  .then(() => {
    console.log("MongoDB Connected");
    // Initialize reminder scheduler after DB connection
    reminderScheduler.initialize();
  })
  .catch((err) => console.log(err));

// Routes
app.use("/api/resources", resourceRoutes);
app.use("/api/admin/resources", adminResourceRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/study-plans", studyPlanRoutes); // ✅ includes nested task routes
app.use("/api/reminders", reminderRoutes); // ✅ reminder notifications
app.use("/api/posts", postRoutes); // ✅ Wall feature - posts
app.use("/api/reactions", reactionRoutes); // ✅ Wall feature - emoji reactions
app.use("/api/users", userRoutes); // ✅ User profiles and follow system

// Catch-all 404 handler
app.use((req, res) => {
  console.error(`❌ 404 NOT FOUND: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

module.exports = app;