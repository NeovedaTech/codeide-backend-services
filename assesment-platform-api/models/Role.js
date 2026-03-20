import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    roleId: { type: Number, unique: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);