import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const SectionSchema = new Schema({
  title: { type: String, required: true },
  questionPool: {
    type: Schema.Types.ObjectId,
    ref: "QuestionPool",
    default: null,
  },
  problemPool: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
  maxQuestion: { type: Number },
  maxTime: { type: Number },
  maxScore: { type: Number },
  description: { type: String },
  type: { type: String, enum: ["quiz", "coding", "mixed"], default: "quiz" },
});

const AssesmentSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    skillId: { type: Number, ref: "Skill", default: null },
    sections: [SectionSchema],
    isProctored:      { type: Boolean, default: false },
    isAvEnabled:      { type: Boolean, default: false },
    isScreenCapture:  { type: Boolean, default: false },
    passCodeEnabled: { type: Boolean, default: false },
    passCode:        { type: String,  default: null },
    isPublished:     { type: Boolean, default: false },
    isActive:        { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

AssesmentSchema.pre("save", async function () {
  if (this.isModified("passCode") && this.passCode) {
    this.passCode = await bcrypt.hash(this.passCode, 10);
  }
});

const Assesment = mongoose.model("Assesment", AssesmentSchema);
export default Assesment;
