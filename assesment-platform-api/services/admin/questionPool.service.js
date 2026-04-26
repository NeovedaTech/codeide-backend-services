import { QuestionPool } from "../../models/QuestionPool.js";

export const listPools = async () => {
  return QuestionPool.find()
    .select("name questions problem createdAt")
    .sort({ createdAt: -1 });
};

export const getPoolById = async (id) => {
  return QuestionPool.findById(id).populate("problem", "title difficulty");
};

export const createPool = async (data) => {
  return QuestionPool.create(data);
};

export const updatePool = async (id, data) => {
  const pool = await QuestionPool.findById(id);
  if (!pool) {
    const err = new Error("Question pool not found");
    err.status = 404;
    throw err;
  }
  Object.assign(pool, data);
  return pool.save();
};

export const deletePool = async (id) => {
  const deleted = await QuestionPool.findByIdAndDelete(id);
  if (!deleted) {
    const err = new Error("Question pool not found");
    err.status = 404;
    throw err;
  }
  return { deleted: true };
};

export const addQuestion = async (poolId, question) => {
  const pool = await QuestionPool.findById(poolId);
  if (!pool) {
    const err = new Error("Question pool not found");
    err.status = 404;
    throw err;
  }
  pool.questions.push(question);
  return pool.save();
};

export const updateQuestion = async (poolId, questionId, data) => {
  const pool = await QuestionPool.findById(poolId);
  if (!pool) {
    const err = new Error("Question pool not found");
    err.status = 404;
    throw err;
  }
  const question = pool.questions.id(questionId);
  if (!question) {
    const err = new Error("Question not found");
    err.status = 404;
    throw err;
  }
  Object.assign(question, data);
  return pool.save();
};

export const deleteQuestion = async (poolId, questionId) => {
  const pool = await QuestionPool.findById(poolId);
  if (!pool) {
    const err = new Error("Question pool not found");
    err.status = 404;
    throw err;
  }
  pool.questions.pull({ _id: questionId });
  return pool.save();
};
