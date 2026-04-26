import Assesment        from "../../models/Assesment.js";
import AssesmentSolution from "../../models/Solution.js";
import User             from "../../models/User.js";
import Skill            from "../../models/Skill.js";

export const getDashboardMetrics = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalAssessments,
    submittedToday,
    pendingEvaluation,
    totalCandidates,
    flaggedSolutions,
    certificatesSent,
    recentSubmissions,
    submissionsBySkillRaw,
  ] = await Promise.all([
    Assesment.countDocuments({ isActive: true }),

    AssesmentSolution.countDocuments({
      isSubmitted: true,
      updatedAt:   { $gte: todayStart },
    }),

    AssesmentSolution.countDocuments({
      isSubmitted:  true,
      isEvaluated:  false,
    }),

    User.countDocuments(),

    AssesmentSolution.countDocuments({ ufmAttempts: { $gte: 3 } }),

    AssesmentSolution.countDocuments({ certificateSent: true }),

    AssesmentSolution.find({ isSubmitted: true })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("userId",       "name email")
      .populate("assessmentId", "name")
      .select("userId assessmentId ufmAttempts feedback updatedAt isEvaluated"),

    AssesmentSolution.aggregate([
      { $match: { isSubmitted: true } },
      {
        $lookup: {
          from:         "assesments",
          localField:   "assessmentId",
          foreignField: "_id",
          as:           "assessment",
        },
      },
      { $unwind: "$assessment" },
      {
        $group: {
          _id:   "$assessment.skillId",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  // Resolve skill names
  const skillIds = submissionsBySkillRaw.map((s) => s._id).filter(Boolean);
  const skills   = await Skill.find({ skillId: { $in: skillIds } }).select("skillId name");
  const skillMap = Object.fromEntries(skills.map((s) => [s.skillId, s.name]));

  return {
    totalAssessments,
    submittedToday,
    pendingEvaluation,
    totalCandidates,
    flaggedSolutions,
    certificatesSent,
    recentSubmissions,
    submissionsBySkill: submissionsBySkillRaw.map((s) => ({
      skillName: skillMap[s._id] || "Unknown",
      count:     s.count,
    })),
  };
};
