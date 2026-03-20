import axios from 'axios'
import ExamSolution from '../../../../models/Exam/ExamSolution.js';
import { EVALUATOR_API } from '../../../../config/config.js';
export const startSection = async (req, res) => {
  try {
    const { testId, userId, sectionId, sectionType } = req.body;

    if (!testId || !userId || !sectionId || !sectionType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check for duplicate section only if needed (optional)
    const existing = await ExamSolution.findOne({
      testId,
      userId,
      'response.sectionId': sectionId,
    });

    if (existing) {
      const existingSection = existing.response.find(
        (sec) => sec.sectionId.toString() === sectionId
      );
      return res.status(200).json({ message: "Section already started", section: existingSection });
    }

    const newSection = {
      sectionId,
      sectionType,
      correctAnswers: 0,
      totalQuestions: 0,
      quizAnswers: [],
      codingAnswers: [],
      startedAt: new Date(),
      pausedAt: null,
      durationUnavailaible: 0,
      isSubmitted: false,
    };

    const updated = await ExamSolution.updateOne(
      { testId, userId },
      { $push: { response: newSection } }
    );

    if (updated.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to start section" });
    }

    return res.status(200).json({ message: "Section started", section: newSection });
  } catch (error) {
    console.error("Error in startSection:", error);
    return res.status(500).json({ message: "Server error while starting section" });
  }
};



