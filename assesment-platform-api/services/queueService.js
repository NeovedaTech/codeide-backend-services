// This file provides an example of how to add jobs to the assesmentQueue. 
// You can adapt this code to fit your application's needs.

import { assesmentQueue } from '../queue/mainQueue.js'; // Adjust path if necessary

/**
 * Adds a job to the assesmentQueue.
 * @param {string} jobName - The name of the job.
 * @param {object} jobData - The data for the job.
 * @returns {Promise<object>} The created job.1
 */
async function addJobToMainQueue(jobName, jobData) {
  try {
    const job = await assesmentQueue.add(jobName, jobData, {
      // Optional: Job options like attempts, delay, priority, etc.
      // For example, to retry a job 3 times with exponential backoff:
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000, // 1 second
      },
    });
    console.log(`Job ${job.id} added to assesmentQueue with name "${jobName}"`);
    return job;
  } catch (error) {
    console.error('Error adding job to assesmentQueue:', error);
    throw error;
  }
}

// Example of how you might export and use this function elsewhere in your app.
export { addJobToMainQueue };


/*
  // ===================
  //   Example Usage
  // ===================
  //
  // You would import and call this function from another part of your application,
  // for example, within one of your controller functions when a specific event occurs.

  import { addJobToMainQueue } from './services/queueService.js'; // Adjust path

  // Inside an async function, like an Express route handler:
  //
  // async (req, res) => {
  //   try {
  //     const { assessmentId, userId, submissionData } = req.body;
  //     await addJobToMainQueue('processAssessmentSubmission', {
  //       assessmentId,
  //       userId,
  //       submissionData,
  //     });
  //     res.status(202).json({ message: 'Assessment submitted for processing.' });
  //   } catch (error) {
  //     res.status(500).json({ message: 'Failed to queue assessment for processing.' });
  //   }
  // }
*/
