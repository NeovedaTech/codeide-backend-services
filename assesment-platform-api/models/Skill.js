import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    skillId: { type: Number, unique: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Skill", skillSchema);