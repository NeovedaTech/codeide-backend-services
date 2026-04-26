import * as svc from "../../services/admin/questionPool.service.js";

export const list = async (req, res) => {
  try {
    const data = await svc.listPools();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const data = await svc.getPoolById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Question pool not found" });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await svc.createPool(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await svc.updatePool(req.params.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await svc.deletePool(req.params.id);
    return res.status(200).json({ success: true, message: "Question pool deleted" });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const data = await svc.addQuestion(req.params.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const data = await svc.updateQuestion(req.params.id, req.params.questionId, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const data = await svc.deleteQuestion(req.params.id, req.params.questionId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
