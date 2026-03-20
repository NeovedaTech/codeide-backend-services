import AssesmentSolution from "../models/Solution.js";
import Assesment from "../models/Assesment.js";
import User from "../models/User.js";
import { generateCertificatePDF } from "../cron/sendMail.js";

export const getCertificate = async (req, res, next) => {
  try {
    const { solutionId } = req.params;

    const solution = await AssesmentSolution.findById(solutionId);
    if (!solution) return res.status(404).json({ success: false, message: "Solution not found" });
    if (!solution.isSubmitted) return res.status(403).json({ success: false, message: "Assessment not submitted" });

    const [user, assessment] = await Promise.all([
      User.findById(solution.userId),
      Assesment.findById(solution.assessmentId),
    ]);

    if (!user || !assessment) return res.status(404).json({ success: false, message: "User or assessment not found" });

    // Compute correct / total from response
    let correct = 0;
    let total = 0;
    for (const section of solution.response || []) {
      if (section.sectionType === "coding") {
        const answers = section.codingAnswers?.[0] || {};
        Object.values(answers).forEach((ans) => {
          correct += ans.passed || 0;
          total   += ans.total  || 0;
        });
      } else if (section.sectionType === "quiz") {
        correct += section.correctAnswers || 0;
        total   += section.totalQuestions || 0;
      }
    }

    const score    = total > 0 ? correct : null;
    const maxScore = total > 0 ? total   : null;

    const pdfBuffer = await generateCertificatePDF(
      user.name,
      assessment.name,
      score    ?? "Passed",
      maxScore ?? null,
      solutionId
    );

    const filename = assessment.name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .concat("_Certificate.pdf");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
