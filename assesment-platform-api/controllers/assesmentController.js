import Assesment from '../models/Assesment.js';
import AssesmentSolution from '../models/Solution.js';
import { assesmentQueue } from '../queue/mainQueue.js';
import { ASSESMENT_JOB } from '../constants/constants.js';
export const getSolution = async (req, res) => {
    try {
        const { testId, userId } = req.params;
        const solution = await AssesmentSolution.findOne({ assesmentId: testId, userId: userId });
        if (!solution) {
            return res.status(404).json({ message: 'Solution not found' });
        }
        res.json(solution);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const startAssesment = async (req, res) => {
    try {
        // Logic to start an assessment
        res.json({ message: 'Assessment started' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markUfm = async (req, res) => {
    try {
        // Logic to mark for unfair means
        res.json({ message: 'Marked for UFM' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserAssesments = async (req, res) => {
    try {
        const { userId } = req.params;
        const assesments = await Assesment.find({ 'userDetails.userId': userId });
        res.json(assesments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const getAllAssessments = async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const skip  = (page - 1) * limit;

        const filter = {};
        if (req.query.skillId) filter.skillId = Number(req.query.skillId);

        const [data, total] = await Promise.all([
            Assesment.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            Assesment.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const submitAssesment = async (req, res) => {
    try {
        const { assesmentId, userId } = req.body;
        // Logic to submit an assessment
        await assesmentQueue.add(ASSESMENT_JOB, { assesmentId, userId });
        res.json({ message: 'Assessment submitted and job added to queue' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSolutionById = async (req, res) => {
    const { solutionId } = req.params;

    if (!solutionId) return res.json({ message: "Failed to fetch", success: false, error: "Solution Id not provided" }).status(400);
    try {
        const data = await AssesmentSolution.findById(solutionId);
        return res.json({data, message:"Fetched Successfully"});
    } catch (e) {
        console.log(e)
        res.json({ message: "internal server error", success: false, error: e }).status(500);
    }
}