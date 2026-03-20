import { Schema, model } from "mongoose";
import { QuestionSchema } from "./QuestionSchema.js";

const QuestionPoolSchema = new Schema(
  {
    name: { type: String, required: true },
    questions: {
      type: [QuestionSchema],
      default: [],
    },
    problem: { // Add the problem field
      type: Schema.Types.ObjectId,
      ref: 'Problem', // Reference the Problem model
      required: false // Problem is optional
    },
    /* More Fields Can be added later */
  },
  { timestamps: true },
);

export const QuestionPool = model("QuestionPool", QuestionPoolSchema);
