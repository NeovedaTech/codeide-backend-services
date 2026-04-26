import Problem from "../../models/Problem.js";

export const listProblems = async ({
  difficulty,
  language,
  search,
  page  = 1,
  limit = 20,
} = {}) => {
  const pageNum  = Math.max(parseInt(page), 1);
  const limitNum = Math.min(parseInt(limit), 50);
  const skip     = (pageNum - 1) * limitNum;

  const filter = {};
  if (difficulty) filter.difficulty          = difficulty;
  if (language)   filter.languagesSupported  = language;
  if (search)     filter.title               = { $regex: search, $options: "i" };

  const [data, total] = await Promise.all([
    Problem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select("title difficulty languagesSupported timeLimit memoryLimit createdAt"),
    Problem.countDocuments(filter),
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

export const getProblemById = async (id) => {
  return Problem.findById(id);
};

export const createProblem = async (data) => {
  return Problem.create(data);
};

export const updateProblem = async (id, data) => {
  const problem = await Problem.findById(id);
  if (!problem) {
    const err = new Error("Problem not found");
    err.status = 404;
    throw err;
  }
  Object.assign(problem, data);
  return problem.save();
};

export const deleteProblem = async (id) => {
  const deleted = await Problem.findByIdAndDelete(id);
  if (!deleted) {
    const err = new Error("Problem not found");
    err.status = 404;
    throw err;
  }
  return { deleted: true };
};
