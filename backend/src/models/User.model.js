const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    phoneNumber: {
      type: String,
      default: null,
      trim: true
    },
    // Profile Information
    avatar: {
      type: String,
      default: null
    },
    /** Hex color for letter avatar (e.g. #6366f1) — optional */
    avatarColor: {
      type: String,
      default: null,
      maxlength: 7
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500
    },
    location: {
      type: String,
      default: "",
      trim: true
    },
    interests: {
      type: String,
      default: "",
      trim: true
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);