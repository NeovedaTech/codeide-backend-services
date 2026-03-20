import { Worker } from 'bullmq';
import { db, redisConnection } from '../../config/config.js';
import { ASSESMENT_QUEUE } from '../constants/constants.js';
import { examEvaluator } from './evaluator.js';
db();
const processJob = async (job) => {
  console.log(`Processing job ${job.id} of type ${job.name}`);
  examEvaluator(job);
  // Add your job processing logic here
  return 'done';
};

const worker = new Worker(ASSESMENT_QUEUE, processJob, {
  connection: redisConnection,
  autorun: true,
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} has failed with ${err.message}`);
});

console.log('Worker started for queue:', ASSESMENT_QUEUE);

