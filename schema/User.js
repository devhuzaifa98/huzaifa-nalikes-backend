import mongoose from "mongoose";

const User = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    address: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", User);
