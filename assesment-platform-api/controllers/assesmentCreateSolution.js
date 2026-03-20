import redis from "../../config/redisconn.js";
import Assesment from "../models/Assesment.js";
import Problem from "../models/Problem.js";
import { QuestionPool } from "../models/QuestionPool.js";
import AssesmentSolution from "../models/Solution.js";

const shuffleArray = (arr) => {
  let i = arr.length;
  while (--i > 0) {
    const randIdx = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[randIdx]] = [arr[randIdx], arr[i]];
  }
  return arr;
};

const QUESTION_CACHE_KEY = (testId, sectionId) =>
  `test:${testId}:section:${sectionId}:questionPool`;
const PROBLEM_CACHE_KEY = (testId, sectionId) =>
  `test:${testId}:section:${sectionId}:problemPool`;

const cacheQuestionPool = async (testId, sectionId, questionPoolId) => {
  const poolDoc = await QuestionPool.findById(questionPoolId).lean();
  if (!poolDoc || !Array.isArray(poolDoc.questions)) {
    throw new Error(`Invalid or missing questionPool for section ${sectionId}`);
  }

  const shuffled = shuffleArray([...poolDoc.questions]).slice(0, 100);
  const key = QUESTION_CACHE_KEY(testId, sectionId);

  await redis.set(key, JSON.stringify(shuffled));
  await redis.expire(key, 4600);

  return shuffled;
};

const getCachedOrFreshQuestions = async (testId, sectionId, questionPoolId) => {
  const key = QUESTION_CACHE_KEY(testId, sectionId);
  const cached = await redis.get(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error(
        `Failed to parse Redis data for key ${key}. Refetching from DB.`,
      );
    }
  }
  return await cacheQuestionPool(testId, sectionId, questionPoolId);
};

const cacheProblemPool = async (testId, sectionId, problemIds) => {
  const problems = await Problem.find({ _id: { $in: problemIds } }).lean();
  const key = PROBLEM_CACHE_KEY(testId, sectionId);
  await redis.set(key, JSON.stringify(problems));
  await redis.expire(key, 3600);
  return problems;
};

const getCachedOrFreshProblems = async (testId, sectionId, problemIds) => {
  const key = PROBLEM_CACHE_KEY(testId, sectionId);
  const cached = await redis.get(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error(
        `Failed to parse Redis data for key ${key}. Refetching from DB.`,
      );
    }
  }
  return await cacheProblemPool(testId, sectionId, problemIds);
};

const createTestSnapshot = async (test) => {
  const snapshotPromises = test.sections.map(async (section) => {
    const snapshot = {
      type: section.type,
      sectionId: section._id.toString(),
      title: section.title,
      maxTime: section.maxTime,
      maxScore: section.maxScore,
    };

    const maxQ = section.maxQuestion || 0;

    if (section.type === "quiz" || section.type === "mixed") {
      const pickCount = section.type === "mixed" ? Math.floor(maxQ / 2) : maxQ;

      const fullQuestionPool = await getCachedOrFreshQuestions(
        test._id,
        section._id,
        section.questionPool,
      );

      snapshot.questions = shuffleArray([...fullQuestionPool]).slice(
        0,
        pickCount,
      );
    }

    if (section.type === "coding" || section.type === "mixed") {
      const pickCount = section.type === "mixed" ? Math.ceil(maxQ / 2) : maxQ;

      const fullProblemPool = await getCachedOrFreshProblems(
        test._id,
        section._id,
        section.problemPool,
      );

      snapshot.problems = shuffleArray([...fullProblemPool]).slice(
        0,
        pickCount,
      );
    }

    snapshot.meta = {
      totalQuestions: snapshot.questions?.length || 0,
      totalProblems: snapshot.problems?.length || 0,
    };

    return snapshot;
  });

  return await Promise.all(snapshotPromises);
};

export const getUserAssessmentSolution = async (req, res) => {
  try {
    const { assessmentId, userId } = req.body;
    if (!assessmentId || !userId) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const test = await Assesment.findOne({ _id: assessmentId }).populate(
      "sections.questionPool",
    );

     console.log(test);
    if (!test) {
      return res.status(404).json({ message: "No Exam found" });
    }

    let testSolution = await AssesmentSolution.findOne({
      assessmentId,
      userId,
    });

    if (!testSolution) {
      const assesmentSnapshot = await createTestSnapshot(test);
      testSolution = await AssesmentSolution.create({
        assessmentId,
        userId,
        assesmentSnapshot,
      });
    }
    // console.log(test.userDetails);
    // console.log(test.isProtected)
    return res.status(200).json({
      message: "Exam solution found",
      data: {
        ...testSolution.toObject(),
        assesmentSnapshot: sanitizeTestSnapshot(testSolution.assesmentSnapshot),
      },
    });
  } catch (error) {
    console.error("Error in getUserTestSolution:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markUFM = async (req, res) => {
  try {
    const { submissionId } = req.body;
    if (!submissionId) {
      return res.status(400).json({ message: "Missing submissionId" });
    }

    const updated = await ExamSolution.findOneAndUpdate(
      { _id: submissionId },
      { $inc: { ufmAttempts: 1 } },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Submission not found." });
    }

    return res.status(200).json({
      message: "UFM marked successfully.",
      submitted: false,
      result: updated,
    });
  } catch (e) {
    console.error("Error in markUFM:", e);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: e.message });
  }
};

export const submitExamDetails = async (req, res) => {
  try {
    const { submissionId, userDetails } = req.body;
    if (!submissionId || !userDetails) {
      return res
        .status(400)
        .json({ message: "Missing submissionId or userDetails" });
    }

    const updated = await ExamSolution.findOneAndUpdate(
      { _id: submissionId },
      { $set: { userDetails } },
      { new: true },
    );
    if (!updated) {
      return res.status(404).json({ message: "Submission not found." });
    }

    return res
      .status(200)
      .json({ message: "User details updated successfully.", status: true });
  } catch (error) {
    console.error("Error in submitDetails:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { submissionId, feedback } = req.body;
    if (!submissionId || !feedback) {
      return res
        .status(400)
        .json({ message: "Missing submissionId or feedback" });
    }

    const updated = await ExamSolution.findOneAndUpdate(
      { _id: submissionId },
      { $set: { feedback } },
      { new: true },
    );
    if (!updated) {
      return res.status(404).json({ message: "Submission not found." });
    }

    return res
      .status(200)
      .json({ message: "Feedback submitted successfully.", status: true });
  } catch (error) {
    console.error("Error in submitFeedback:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

function sanitizeTestSnapshot(testSnapshot) {
  console.log(testSnapshot);
  return testSnapshot.map((section) => {
    if (section.type === "quiz") {
      return {
        ...section,
        questions: section.questions.map((question) => ({
          ...question,
          options: question?.options?.map(({ isCorrect, ...rest }) => rest),
        })),
      };
    }

    if (section.type === "coding") {
      return {
        ...section,
        problems:
          section.problems?.map((problem) => ({
            ...problem,
            testCases: problem.testCases?.slice(0, 2) || [],
          })) || [],
      };
    }

    return section;
  });
}

export const getAllSubmissions = async (req, res) => {
  try {
    const { examId } = req.params;
    const { page = 1, limit = 10, query } = req.query;

    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
      {
        $match: {
          testId: new mongoose.Types.ObjectId(examId),
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: "$user" },

      ...(query
        ? [
            {
              $match: {
                "user.email": { $regex: query, $options: "i" },
              },
            },
          ]
        : []),

      { $sort: { updatedAt: -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum },

            // ✅ PURE INCLUSION PROJECTION
            {
              $project: {
                _id: 1,
                testId: 1,
                userId: 1,
                currSection: 1,
                ufmAttempts: 1,
                hasAgreed: 1,
                isSubmitted: 1,
                isEvaluated: 1,
                createdAt: 1,
                updatedAt: 1,

                user: {
                  _id: "$user._id",
                  name: "$user.name",
                  email: "$user.email",
                },
              },
            },
          ],
          count: [{ $count: "total" }],
        },
      },
    ];

    const result = await ExamSolution.aggregate(pipeline);

    const submissions = result[0]?.data || [];
    const total = result[0]?.count[0]?.total || 0;

    return res.status(200).json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      submissions,
    });
  } catch (error) {
    console.error("getAllSubmissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};
