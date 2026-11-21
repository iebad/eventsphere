import mongoose from "mongoose";

const connectToDb = async (URI) => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectToDb;