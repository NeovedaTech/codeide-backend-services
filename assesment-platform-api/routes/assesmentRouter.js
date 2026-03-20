import { Router } from "express";
import {
    markUfm,
    getUserAssesments,
    submitAssesment,
    getSolutionById,
    getAllAssessments
} from "../controllers/assesmentController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAllowed } from "../middlewares/isAllowed.js";
import { getUserAssessmentSolution } from "../controllers/assesmentCreateSolution.js";
import { getServerSync } from "../controllers/helpers.js";
import startAssessment from "../controllers/assessmentStart.js";
import { submitSection } from "../controllers/assesmentSubmit.js";
import { getCertificate } from "../controllers/certificateController.js";

const assesmentRouter = Router();
assesmentRouter.get('/all', getAllAssessments);
assesmentRouter.post('/solution', isAuthenticated, isAllowed, getUserAssessmentSolution);
assesmentRouter.post('/start-assesment', isAuthenticated, startAssessment);
assesmentRouter.post('/mark-ufm', isAuthenticated, markUfm);
assesmentRouter.get('/users/assesments/:userId', isAuthenticated, isAllowed, getUserAssesments);
assesmentRouter.post('/submit-assesment', isAuthenticated, submitAssesment);
assesmentRouter.get('/server-sync', isAuthenticated, isAllowed, getServerSync);
assesmentRouter.put('/submit-section', isAuthenticated, submitSection);
assesmentRouter.get('/solution/:solutionId', isAuthenticated, getSolutionById);
assesmentRouter.get('/certificate/:solutionId', getCertificate);
export default assesmentRouter;
