import Assesment from "../models/Assesment.js";

export const getAssessmentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await Assesment.findOne({ _id: id, isActive: true, isPublished: true })
      .select("name slug isProctored isAvEnabled isScreenCapture passCodeEnabled sections")
      .lean();

    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found or not published" });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: assessment._id,
        name: assessment.name,
        slug: assessment.slug,
        isProctored:      assessment.isProctored,
        isAvEnabled:      assessment.isAvEnabled,
        isScreenCapture:  assessment.isScreenCapture,
        passCodeEnabled:  assessment.passCodeEnabled,
        sections: assessment.sections.map((s) => ({
          title:    s.title,
          type:     s.type,
          maxTime:  s.maxTime,
          maxScore: s.maxScore,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
