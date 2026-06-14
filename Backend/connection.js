const mongoose = require("mongoose");

async function connectMongoDB(url) {
  try {
    await mongoose.connect(url);
    console.log("✅ Connected to MongoDB Successfully");
  } catch (err) {
    console.error(`❌ Failed to connect MongoDB: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { connectMongoDB };
