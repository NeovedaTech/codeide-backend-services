import { getDashboardMetrics } from "../../services/admin/metrics.service.js";

export const metrics = async (req, res) => {
  try {
    const data = await getDashboardMetrics();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
