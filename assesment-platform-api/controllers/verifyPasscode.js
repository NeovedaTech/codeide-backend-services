import bcrypt from "bcrypt";
import Assesment from "../models/Assesment.js";

export const verifyPasscode = async (req, res) => {
  try {
    const { assessmentId, passCode } = req.body;
    if (!assessmentId || !passCode) {
      return res.status(400).json({ message: "Missing assessmentId or passCode" });
    }

    const assessment = await Assesment.findById(assessmentId).select(
      "passCodeEnabled passCode"
    );
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    if (!assessment.passCodeEnabled) {
      return res.status(200).json({ valid: true });
    }

    const valid = await bcrypt.compare(passCode, assessment.passCode);
    if (!valid) {
      return res.status(403).json({ valid: false, message: "Invalid passcode" });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Error in verifyPasscode:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
