import { Router } from "express";
import {
    markUfm,
    getUserAssesments,
    submitAssesment,
    getSolutionById,
    getAllAssessments
} from "../controllers/assesmentController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAllowed }       from "../middlewares/isAllowed.js";
import { getUserAssessmentSolution } from "../controllers/assesmentCreateSolution.js";
import { getServerSync }  from "../controllers/helpers.js";
import startAssessment    from "../controllers/assessmentStart.js";
import { submitSection }  from "../controllers/assesmentSubmit.js";
import { getCertificate } from "../controllers/certificateController.js";
import { verifyPasscode } from "../controllers/verifyPasscode.js";
import { getAssessmentInfo } from "../controllers/assessmentInfo.js";

const assesmentRouter = Router();

// ── Public ────────────────────────────────────────────────────────────────────
assesmentRouter.get('/all',               getAllAssessments);
assesmentRouter.get('/info/:id',          getAssessmentInfo);   // assessment metadata (no solution created)
assesmentRouter.get('/certificate/:solutionId', getCertificate);

// ── Candidate (authenticated, any role) ───────────────────────────────────────
assesmentRouter.post('/solution',            isAuthenticated, getUserAssessmentSolution);
assesmentRouter.post('/start-assesment',     isAuthenticated, startAssessment);
assesmentRouter.post('/verify-passcode',     isAuthenticated, verifyPasscode);
assesmentRouter.post('/mark-ufm',            isAuthenticated, markUfm);
assesmentRouter.post('/submit-assesment',    isAuthenticated, submitAssesment);
assesmentRouter.put ('/submit-section',      isAuthenticated, submitSection);
assesmentRouter.get ('/solution/:solutionId',isAuthenticated, getSolutionById);
assesmentRouter.get ('/server-sync',         isAuthenticated, getServerSync);
assesmentRouter.get ('/users/assesments/:userId', isAuthenticated, getUserAssesments);

export default assesmentRouter;
