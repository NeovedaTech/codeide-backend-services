import Assesment from "../../models/Assesment.js";
import AssesmentSolution from "../../models/Solution.js";

export const listAssessments = async ({
  page = 1,
  limit = 20,
  skillId,
  isPublished,
} = {}) => {
  const pageNum  = Math.max(parseInt(page), 1);
  const limitNum = Math.min(parseInt(limit), 50);
  const skip     = (pageNum - 1) * limitNum;

  const filter = { isActive: true };
  if (skillId    !== undefined) filter.skillId    = Number(skillId);
  if (isPublished !== undefined)
    filter.isPublished = isPublished === "true" || isPublished === true;

  const [data, total] = await Promise.all([
    Assesment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select("-passCode"),
    Assesment.countDocuments(filter),
  ]);

  const ids       = data.map((a) => a._id);
  const counts    = await AssesmentSolution.aggregate([
    { $match: { assessmentId: { $in: ids } } },
    { $group: { _id: "$assessmentId", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.count]),
  );

  return {
    data: data.map((a) => ({
      ...a.toObject(),
      attemptCount: countMap[a._id.toString()] || 0,
    })),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const getAssessmentById = async (id) => {
  return Assesment.findOne({ _id: id, isActive: true })
    .populate("sections.questionPool", "name")
    .select("-passCode");
};

export const createAssessment = async (data) => {
  const { passCode, passCodeEnabled, isAvEnabled, isProctored, ...rest } = data;

  if (passCodeEnabled && !passCode) {
    const err = new Error("passCode is required when passCodeEnabled is true");
    err.status = 400;
    throw err;
  }

  // isAvEnabled always implies isProctored
  const resolvedIsProctored = isAvEnabled ? true : (isProctored || false);

  const assessment = new Assesment({
    ...rest,
    isProctored:     resolvedIsProctored,
    isAvEnabled:     isAvEnabled || false,
    passCodeEnabled: passCodeEnabled || false,
    passCode:        passCodeEnabled ? passCode : null,
  });

  await assessment.save();

  const result = assessment.toObject();
  delete result.passCode;
  return result;
};

export const updateAssessment = async (id, data) => {
  const assessment = await Assesment.findOne({ _id: id, isActive: true });
  if (!assessment) {
    const err = new Error("Assessment not found");
    err.status = 404;
    throw err;
  }

  const { passCode, isAvEnabled, isProctored, passCodeEnabled, ...rest } = data;

  // Validate passcode when enabling
  if (passCodeEnabled && !assessment.passCode && !passCode) {
    const err = new Error("passCode is required when passCodeEnabled is true");
    err.status = 400;
    throw err;
  }

  if (passCodeEnabled === false) {
    assessment.passCode = null;
  } else if (passCode) {
    // pre-save hook will hash it
    assessment.passCode = passCode;
  }

  if (passCodeEnabled !== undefined) assessment.passCodeEnabled = passCodeEnabled;

  // Keep isProctored in sync with isAvEnabled
  if (isAvEnabled !== undefined) {
    assessment.isAvEnabled  = isAvEnabled;
    assessment.isProctored  = isAvEnabled ? true : (isProctored ?? assessment.isProctored);
  } else if (isProctored !== undefined) {
    // Turning off proctoring also turns off AV
    assessment.isProctored = isProctored;
    if (!isProctored) assessment.isAvEnabled = false;
  }

  Object.assign(assessment, rest);
  await assessment.save();

  const result = assessment.toObject();
  delete result.passCode;
  return result;
};

export const deleteAssessment = async (id) => {
  const assessment = await Assesment.findOneAndUpdate(
    { _id: id, isActive: true },
    { $set: { isActive: false } },
    { new: true },
  );
  if (!assessment) {
    const err = new Error("Assessment not found");
    err.status = 404;
    throw err;
  }
  return { deleted: true };
};
