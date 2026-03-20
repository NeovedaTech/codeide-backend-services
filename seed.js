import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Models
import User from './assesment-platform-backend/models/User.js';
import Problem from './assesment-platform-backend/models/Problem.js';
import Assesment from './assesment-platform-backend/models/Assesment.js';
import { QuestionPool } from './assesment-platform-backend/models/QuestionPool.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8')
);

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Problem.deleteMany({});
    await Assesment.deleteMany({});
    await QuestionPool.deleteMany({});
    console.log('Cleared existing data');

    // Insert Problems
    if (seedData.problems) {
      await Problem.insertMany(seedData.problems);
      console.log('Inserted problems');
    }

    // Insert Question Pools
    if (seedData.questionPools) {
      await QuestionPool.insertMany(seedData.questionPools);
      console.log('Inserted question pools');
    }

    // Insert Assessments
    if (seedData.assessments) {
      await Assesment.insertMany(seedData.assessments);
      console.log('Inserted assessments');
    }

    // Insert Users
    if (seedData.users) {
      await User.insertMany(seedData.users);
      console.log('Inserted users');
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedDB();
