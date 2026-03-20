import cron from "node-cron";
import AssesmentSolution from "../models/Solution.js";
import { db } from "../../config/config.js";
import { sendAssessmentCertificateMail } from "./sendMail.js";
import User from "../models/User.js";
import Assesment from "../models/Assesment.js";

export const startNotificationCron = () => {
  // Run every 20 seconds
  cron.schedule("*/20 * * * * *", async () => {
    try {
      console.log("Running notification cron...");
      
      // Find solutions that are evaluated and submitted but NOT yet notified/certificated
      const solutions = await AssesmentSolution.find({
        isEvaluated: true,
        isSubmitted: true,
        $or: [{ certificateSent: false }, { certificateSent: { $exists: false } }],
      });

      if (!solutions.length) return;

      for (const solution of solutions) {
        try {
          const user = await User.findById(solution.userId);
          const assessment = await Assesment.findById(solution.assessmentId);

          if (user && assessment) {
            // Compute correct / total dynamically from solution response
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
                correct += section.correctAnswers  || 0;
                total   += section.totalQuestions  || 0;
              }
            }
            const score    = total > 0 ? correct : null;
            const maxScore = total > 0 ? total   : null;

            await sendAssessmentCertificateMail({
              name: user.name,
              email: user.email,
              assessmentName: assessment.name,
              score:    score    ?? "Passed",
              maxScore: maxScore ?? null,
              solutionId: solution._id.toString(),
            });
            
            // Mark as both notified and certificateSent to prevent other crons (if any) from picking it up
            solution.certificateSent = true;
            solution.notified = true;
            await solution.save();
            
            console.log(`✅ Professional Certificate sent to ${user.email}`);
          }
        } catch (err) {
          console.error(`Error processing solution ${solution._id}:`, err);
        }
      }
    } catch (error) {
      console.error("Notification cron error:", error);
    }
  });
  console.log("Professional Notification Cron started (every 20s)");
};

(async () => {
  await db();
  startNotificationCron();
})();
