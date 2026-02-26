import mongoose from 'mongoose';

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(MONGODB_URI, {

    /*
        Epects Users DB Parameters
    */
    // dbName: process.env.MONGODB_DB_NAME,
    // autoIndex: process.env.NODE_ENV !== 'production',
  });
}
