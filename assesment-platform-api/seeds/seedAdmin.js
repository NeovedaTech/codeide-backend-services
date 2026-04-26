import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env") });

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI not found"); process.exit(1); }

const UserSchema = new mongoose.Schema({
  userId:           { type: String, required: true, unique: true },
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true },
  role:             { type: String, enum: ["candidate", "admin"], default: "candidate" },
  skillLevel:       { type: String, default: "medium" },
  assessmentStatus: { type: String, default: "not_started" },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

await mongoose.connect(uri);
console.log("Connected to MongoDB");

const email    = "admin@assesment.io";
const password = "Admin@123";
const hashed   = await bcrypt.hash(password, 10);
const userId   = `user_${Date.now()}_admin`;

const existing = await User.findOne({ email });
if (existing) {
  // Update role to admin in case it exists without the role
  await User.updateOne({ email }, { $set: { role: "admin" } });
  console.log(`User ${email} already exists — role set to admin`);
} else {
  await User.create({
    userId,
    name: "Admin",
    email,
    password: hashed,
    role: "admin",
    skillLevel: "medium",
    assessmentStatus: "not_started",
  });
  console.log(`Admin user created:`);
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
}

await mongoose.disconnect();
console.log("Done.");
