import AssesmentSolution from "../models/Solution.js";
import Assesment from "../models/Assesment.js";
import User from "../models/User.js";
import axios from "axios";
import { sendAssessmentCertificateMail } from "../cron/sendMail.js";

const CODE_EXECUTION_API = process.env.CODE_EXECUTION_API;

/**
 * Evaluate quiz section
 */
const evaluateQuizSection = (sectionWithSolution, response) => {
    let correctAnswers = 0;
    const questions = sectionWithSolution.questions || [];
    const userAnswers = response || {};
    
    questions.forEach((question) => {
        const userAnswer = userAnswers[question._id];
        const correctOptions = question.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.text);

        if (correctOptions.length > 1) {
            // Multi-correct MCQ
            if (Array.isArray(userAnswer)) {
                const isCorrect = userAnswer.length === correctOptions.length &&
                    userAnswer.every(opt => correctOptions.includes(opt));
                if (isCorrect) {
                    correctAnswers++;
                }
            }
        } else if (correctOptions.length === 1) {
            // Single-correct MCQ
            if (userAnswer === correctOptions[0]) {
                correctAnswers++;
            }
        } else {
            // Text question
            if (userAnswer && userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()) {
                correctAnswers++;
            }
        }
    });

    return correctAnswers;
};

/**
 * Evaluate coding section
 */
const evaluateCodingSection = async (submission, sectionId , response) => {
    try {
        // Find the section in the response array
        var section = submission.response.find(
            r => r.sectionId.toString() === sectionId.toString()
        );
        if(!Array.isArray(section.codingAnswers).length > 0) section.codingAnswers.push(response);
        if (!section || !section.codingAnswers || !section.codingAnswers[0]) {
            throw new Error("Coding answers not found for section");
        }

        // Create a deep copy to avoid mutation issues
        const sectionResponse = JSON.parse(JSON.stringify(section.codingAnswers[0]));

        // Process each question in the coding answers
        await Promise.all(
            Object.keys(sectionResponse).map(async (questionId) => {
                const questionData = sectionResponse[questionId];
                const tokens = questionData?.tokens?.map(t => t.token);
                
                if (!tokens || tokens.length === 0) {
                    console.warn(`No tokens found for question ${questionId}`);
                    return;
                }

                console.log(`Processing ${tokens.length} tokens for question ${questionId}`);
                const tokenString = tokens.join(',');

                try {
                    const res = await axios.get(
                        `${CODE_EXECUTION_API}/submissions/batch?tokens=${tokenString}`,
                        { timeout: 10000 }
                    );

                    const submissions = res.data.submissions || [];
                    const totalCount = submissions.length;
                    const passCount = submissions.filter(s => s.status.id === 3).length;

                    // Update the deep copied object
                    sectionResponse[questionId].passed = passCount;
                    sectionResponse[questionId].total = totalCount;

                    console.log(`Question ${questionId}: ${passCount}/${totalCount} passed`);
                } catch (apiError) {
                    console.error(`Error fetching results for question ${questionId}:`, apiError.message);
                    sectionResponse[questionId].passed = 0;
                    sectionResponse[questionId].total = tokens.length;
                    sectionResponse[questionId].error = apiError.message;
                }
            })
        );

        console.log("Section Response after evaluation:", sectionResponse);
        return sectionResponse;
    } catch (error) {
        console.error("Error in coding section evaluation:", error);
        throw error;
    }
};

/**
 * Main exam evaluator function
 */
export const examEvaluator = async (job) => {
    try {
        const { solutionId, sectionId, sectionType, response, current } = job.data;

        console.log("Evaluation Starts")

        // Validate required fields
        if (!solutionId || !sectionId || !sectionType) {
            throw new Error("Missing required fields");
        }

        if (!['quiz', 'coding'].includes(sectionType)) {
            throw new Error(`Invalid section type: ${sectionType}`);
        }

        const submission = await AssesmentSolution.findById(solutionId);
        if (!submission) {
            throw new Error("Submission not found");
        }

        const sectionWithSolution = submission.assesmentSnapshot.find(
            (s) => s.sectionId.toString() === sectionId.toString()
        );
        
        if (!sectionWithSolution) {
            throw new Error("Section not found in assessment snapshot");
        }

        const totalQuestions = sectionWithSolution?.questions?.length || 0;
        let correctAnswers = 0;
        let evaluatedResponse = null;

        // Evaluate based on section type
        if (sectionType === 'quiz') {
            correctAnswers = evaluateQuizSection(sectionWithSolution, response);
            console.log(`Quiz evaluation: ${correctAnswers}/${totalQuestions} correct`);
        } else if (sectionType === 'coding') {
            // Evaluate the existing coding answers in the submission
            evaluatedResponse = await evaluateCodingSection(submission, sectionId, response);
            console.log(`Coding evaluation completed for section ${sectionId}`);
        }

        // Update submission response - use deep copy for the entire section
        submission.response = submission.response.map((section) => {
            if (section.sectionId.toString() === sectionId.toString()) {
                console.log("Updating section:", section.sectionId);

                // Create a completely new object (deep copy)
                return {
                    sectionId: section.sectionId,
                    sectionType,
                    ...(sectionType === 'quiz'
                        ? { quizAnswers: response }
                        : { codingAnswers: [evaluatedResponse] }),
                    totalQuestions: totalQuestions || -1,
                    correctAnswers: sectionWithSolution?.type === 'quiz' ? correctAnswers : -1
                };
            }
            return section;
        });

        submission.currSection = current + 1;
        if (submission.isSubmitted) {
            submission.isEvaluated = true;
        }
        
        // Mark the response field as modified for Mongoose
        submission.markModified('response');
        
        await submission.save();

        console.log("Successfully saved submission");

        return {
            success: true,
            message: `Updated ${sectionType} answers for section ${sectionId}`,
            nextSection: submission.currSection,
            ...(sectionType === 'quiz' && { correctAnswers, totalQuestions })
        };
    } catch (err) {
        console.error("Error in exam evaluator:", err);
        return {
            success: false,
            message: err.message || "Internal server error",
            error: err.name,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        };
    }
};