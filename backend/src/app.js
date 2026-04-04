const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const resourceRoutes = require("./routes/resource.routes");
const adminResourceRoutes = require("./routes/admin/adminResource.routes");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/auth.routes");
const studyPlanRoutes = require("./routes/studyPlan.routes");
const profileRoutes = require("./routes/profile.routes");

const app = express();

app.use(cors());
app.use(express.json());

/* serve uploaded files */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://student1:8g81fbYGlA0mndvi@cluster0.ux2zfme.mongodb.net/?appName=Cluster0"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/resources", resourceRoutes);
app.use("/api/admin/resources", adminResourceRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/study-plans", studyPlanRoutes); // ✅ includes nested task routes
app.use("/api/profile", profileRoutes);

module.exports = app;