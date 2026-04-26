import mongoose from "mongoose";
const ProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    description: {
      type: String,
    },
    constraints: {
      type: [String],
      default: [],
    },
    inputFormat: {
      type: [String],
      default: [],
    },
    outputFormat: {
      type: [String],
      default: [],
    },
    examples: [
      {
        input: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        output: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        explanation: String,
      },
    ],
    testCases: [
      {
        input: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        output: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        hidden: {
          type: Boolean,
          default: true,
        },
      },
    ],
    functionSignature: [
      {
        language: String,
        signature: String,
      },
    ],
    hints: {
      type: [String],
      default: [],
    },
    timeLimit: {
      type: Number,
      default: 1000,
    },
    memoryLimit: {
      type: Number,
      default: 256000,
    },
    languagesSupported: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);
const Problem = mongoose.model("Problem", ProblemSchema);
export default Problem;
