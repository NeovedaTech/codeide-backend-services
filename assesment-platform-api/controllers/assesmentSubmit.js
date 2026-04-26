import AssesmentSolution from "../models/Solution.js";
import { addJobToMainQueue } from "../services/queueService.js";
import axios from 'axios';
import redis from "../../config/redisconn.js";
export const submitSection = async (req, res) => {
  try {
    const {
      solutionId,
      sectionId,
      sectionType,
      response,
      current,
      autoSubmit, /// help us to directly submit whole of the quiz
    } = req.body;

    console.log(response);
    if (!solutionId) {
      return res.json({ message: "Missing solution id" });
    }
    if (!sectionId) {
      return res.json({ message: "Missing section id" });
    }
    if (!sectionType) {
      return res.json({ message: "Missing section type" });
    }
    if (current === undefined || current === null) {
      return res.json({ message: "Missing current" });
    }
    const userSolution = await AssesmentSolution.findById(solutionId);
    if (!userSolution) {
      return res.json({ message: "Solution not found" });
    }


    if (!userSolution.response.find((res) => res.sectionId.toString() === sectionId)) {
      return res.json({ message: "Section not found", sectionId });
    }
    if (sectionType == "quiz") {
      userSolution.response.find(
        (res) => res.sectionId.toString() === sectionId,
      ).quizAnswers = response;
    }
    // if (sectionType == "coding") {
    //   userSolution.response.find(
    //     (res) => res.sectionId.toString() === sectionId,
    //   ).codingAnswers = response;
    // }

    const isFinalSection = userSolution.assesmentSnapshot.length - 1 == current;
    if (isFinalSection) {
      userSolution.isSubmitted = true;
    } else {
      userSolution.response[current + 1].startedAt = new Date();
    }
    userSolution.currSection += 1;

    await userSolution.save();

    // Clear question/problem pool cache for this assessment on final submission
    // so the next test-taker gets a fresh randomisation from the DB.
    if (isFinalSection) {
      const aid = userSolution.assessmentId.toString();
      const delPromises = userSolution.assesmentSnapshot.map((section) => {
        const sid = section.sectionId;
        return Promise.all([
          redis.del(`test:${aid}:section:${sid}:questionPool`),
          redis.del(`test:${aid}:section:${sid}:problemPool`),
        ]);
      });
      await Promise.all(delPromises).catch(() => {}); // non-blocking — don't fail the response
    }
    await addJobToMainQueue("submitSection", {
      solutionId,
      sectionId,
      sectionType,
      response,
      current,
    });
    return res.json({
      message: "Section Submitted ",
      nextSection: userSolution.isSubmitted ? -1 : current + 1,
      submitted: userSolution.isSubmitted,
    });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal Server Error" });
  }
};
