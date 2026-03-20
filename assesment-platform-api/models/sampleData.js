import mongoose from 'mongoose';

const dummyProblemIds = {
  codingProblem1: new mongoose.Types.ObjectId("60c72b2f9b1d8e001c8e4d10"),
  codingProblem2: new mongoose.Types.ObjectId("60c72b2f9b1d8e001c8e4d11"),
};

const dummyQuestionPoolIds = {
  quizPool: new mongoose.Types.ObjectId("60c72b2f9b1d8e001c8e4d12"),
  codingPool: new mongoose.Types.ObjectId("60c72b2f9b1d8e001c8e4d13"),
};

const assesmentSample = [
  {
    name: "Sample Assessment 1",
    slug: "sample-assessment-1",
    sections: [
      {
        title: "Coding Section",
        problemPool: [
          dummyProblemIds.codingProblem1,
          dummyProblemIds.codingProblem2,
        ],
        questionPool: dummyQuestionPoolIds.codingPool,
        maxQuestion: 2,
        maxTime: 60, // minutes
        maxScore: 100,
        description: "This section contains coding problems.",
        type: "coding",
      },
      {
        title: "Quiz Section",
        questionPool: dummyQuestionPoolIds.quizPool,
        maxQuestion: 10,
        maxTime: 30, // minutes
        maxScore: 50,
        description: "This section contains multiple-choice questions.",
        type: "quiz",
      },
    ],
  },
  // Add more sample assessments here if needed
];

export { assesmentSample, dummyProblemIds, dummyQuestionPoolIds };
