import mongoose from "mongoose";

const roleSkillSchema = new mongoose.Schema(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate relation
roleSkillSchema.index({ role: 1, skill: 1 }, { unique: true });

export default mongoose.model("RoleSkill", roleSkillSchema);