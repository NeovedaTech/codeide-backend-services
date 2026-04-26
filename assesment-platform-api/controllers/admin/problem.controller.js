import * as svc from "../../services/admin/problem.service.js";

export const list = async (req, res) => {
  try {
    const result = await svc.listProblems(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const data = await svc.getProblemById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Problem not found" });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await svc.createProblem(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await svc.updateProblem(req.params.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await svc.deleteProblem(req.params.id);
    return res.status(200).json({ success: true, message: "Problem deleted" });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
