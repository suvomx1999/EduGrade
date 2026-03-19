const mongoose = require('mongoose');
require('dotenv').config();

console.log("Connecting to:", process.env.MONGO_URI.split('@')[1]); // Log only the host for security

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB Atlas!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
