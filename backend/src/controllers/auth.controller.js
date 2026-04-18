const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

/* ================= TOKEN ================= */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1d" }
  );
};

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    console.log("\n🔵 REGISTER REQUEST");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Phone:", phoneNumber);
    console.log("Password length:", password?.length);

    if (!name || !email || !password || !phoneNumber) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        message: "Name, email, password and phone number are required"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Validate phone number format
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      console.log("❌ Invalid phone format");
      return res.status(400).json({
        message: "Phone number must be 10-15 digits (e.g., +94771234567)"
      });
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      role: "student"
    });

    console.log("✅ User created:", user._id);

    const token = generateToken(user);
    console.log("✅ Token generated");

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatar: user.avatar,
        avatarColor: user.avatarColor
      }
    });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({
      message: "Server error while registering user"
    });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("\n🔵 LOGIN REQUEST");
    console.log("Email:", email);
    console.log("Password length:", password?.length);

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log("❌ User not found with email:", email);
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    console.log("✅ User found:", user.email);
    console.log("Password in DB exists:", !!user.password);

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    console.log("✅ Password matches");
    const token = generateToken(user);
    console.log("✅ Token generated");

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatar: user.avatar,
        avatarColor: user.avatarColor
      }
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({
      message: "Server error while logging in"
    });
  }
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user.id;

    if (!phoneNumber) {
      return res.status(400).json({
        message: "Phone number is required"
      });
    }

    // Validate phone number format
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      return res.status(400).json({
        message: "Phone number must be 10-15 digits (e.g., +94771234567)"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { phoneNumber },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({
      message: "Server error while updating profile"
    });
  }
};