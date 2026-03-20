import mongoose, { Schema } from "mongoose";

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
  },
  {
    timestamps: true,
  },
);

const Assesment = mongoose.model("Assesment", AssesmentSchema);
export default Assesment;
