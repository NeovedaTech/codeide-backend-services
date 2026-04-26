import * as svc from "../../services/admin/assessment.service.js";

export const list = async (req, res) => {
  try {
    const result = await svc.listAssessments(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const data = await svc.getAssessmentById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Assessment not found" });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await svc.createAssessment(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await svc.updateAssessment(req.params.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await svc.deleteAssessment(req.params.id);
    return res.status(200).json({ success: true, message: "Assessment deleted" });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
