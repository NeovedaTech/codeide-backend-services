// import AssesmentSolution from "../models/Solution";

import AssesmentSolution from "../models/Solution.js";

// export const startAssessment = async (req, res) => {
//   try {
//     const { submissionId } = req.body;
//     if (!submissionId)
//       return res
//         .status(400)
//         .json({ message: "Missing submissionId", success: false });
//     if (!submissionId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing submissionId" });
//     }

//     const updated = await AssesmentSolution.updateOne(
//       { _id: submissionId },
//       { $set: { hasAgreed: true } },
//     );

//     if (updated.matchedCount === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No test solution found" });
//     }

//     return res.status(200).json({ success: true, message: "Exam started" });
//   } catch (error) {
//     console.error("Error in startTest:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

async function startAssessment(req, res) {
  try {
    
    const { solutionId } = req.body;
    if (!solutionId) {
      return res.status(400).json({ message: "Missing solutionId" });
    }
    const assessmentSolution = await AssesmentSolution.findById(solutionId);
    if (!assessmentSolution) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    const numberOfSections = assessmentSolution?.assesmentSnapshot?.length;
    if (numberOfSections === 0) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    // Create minimal response arrays for each section
    const responses = Array.from({ length: numberOfSections }, (_, index) => ({
      sectionId: assessmentSolution?.assesmentSnapshot[index]?.sectionId,
      sectionType: assessmentSolution?.assesmentSnapshot[index]?.type,
      quizAnswers: [],
      codingAnswers: [],
      startedAt: index === 0 ? new Date() : null, 
      pausedAt: null,
      durationUnavailable: null,
      isSubmitted: false,
    }));

    // Create the AssessmentSolution document

    assessmentSolution.response = responses;
    assessmentSolution.hasAgreed = true;
    // Save to database
    await assessmentSolution.save();

    return res.status(200).json({
      success: true,
      message: "Assessment started successfully",
      assessmentSolution,
    });
  } catch (error) {
    console.error("Error starting test:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default startAssessment;
