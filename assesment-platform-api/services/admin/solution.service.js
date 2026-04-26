import AssesmentSolution from "../../models/Solution.js";

export const listSolutions = async ({
  assessmentId,
  minViolations,
  isEvaluated,
  isSubmitted,
  page  = 1,
  limit = 20,
} = {}) => {
  const pageNum  = Math.max(parseInt(page), 1);
  const limitNum = Math.min(parseInt(limit), 50);
  const skip     = (pageNum - 1) * limitNum;

  const filter = {};
  if (assessmentId)       filter.assessmentId = assessmentId;
  if (isEvaluated !== undefined)
    filter.isEvaluated = isEvaluated === "true" || isEvaluated === true;
  if (isSubmitted !== undefined)
    filter.isSubmitted = isSubmitted === "true" || isSubmitted === true;
  if (minViolations !== undefined)
    filter.ufmAttempts = { $gte: Number(minViolations) };

  const [data, total] = await Promise.all([
    AssesmentSolution.find(filter)
      .populate("userId",       "name email userId")
      .populate("assessmentId", "name slug")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select("-assesmentSnapshot -response"),
    AssesmentSolution.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const getSolutionById = async (solutionId) => {
  return AssesmentSolution.findById(solutionId)
    .populate("userId",       "name email userId skillLevel")
    .populate("assessmentId", "name slug isProctored isAvEnabled isScreenCapture");
};
