import { Router } from "express";
import { addJobToMainQueue } from "../services/queueService.js";
import { QuestionPool } from "../models/QuestionPool.js";
import Problem from "../models/Problem.js";

const testRouter = Router();
/**
 * @route   POST /api/v1/test/add-job
 * @desc    Adds a test job to the mainQueue
 * @access  Public
 *
 * @body    { "jobName": "someJob", "jobData": { "key": "value" } }
 */
testRouter.post('/add-job', async (req, res) => {
    const { jobName, jobData } = req.body;

    if (!jobName || !jobData) {
        return res.status(400).json({ message: 'jobName and jobData are required in the request body' });
    }

    try {
        const job = await addJobToMainQueue(jobName, jobData);
        res.status(201).json({
            message: 'Job added successfully to mainQueue',
            jobId: job.id,
            jobName: job.name,
            jobData: job.data,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to add job to queue',
            error: error.message,
        });
    }
});

export default testRouter;
