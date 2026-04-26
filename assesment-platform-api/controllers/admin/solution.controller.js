import * as svc from "../../services/admin/solution.service.js";

export const list = async (req, res) => {
  try {
    const result = await svc.listSolutions(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const data = await svc.getSolutionById(req.params.solutionId);
    if (!data) return res.status(404).json({ success: false, message: "Solution not found" });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
