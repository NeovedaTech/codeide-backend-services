import AssesmentSolution from "../models/Solution.js";
import { addJobToMainQueue } from "../services/queueService.js";
import axios from 'axios'
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

    if (userSolution.assesmentSnapshot.length - 1 == current) {
      userSolution.isSubmitted = true;
    } else {
      userSolution.response[current + 1].startedAt = new Date();
    }
    userSolution.currSection += 1;

    await userSolution.save();
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
