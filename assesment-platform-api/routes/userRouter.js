import { Router } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Assesment from "../models/Assesment.js";
import Solution from "../models/Solution.js";

const userRouter = Router();

userRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, skillLevel } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    user = new User({
      userId: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      skillLevel: skillLevel || "medium",
      assessmentId: "default",
      createdAt: new Date(),
    });

    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

userRouter.get("/:userId/completed-assessments", async (req, res) => {
  try {
    const { userId } = req.params;
    const completed = await Solution.find({ userId, isSubmitted: true }).select('assessmentId _id');
    const data = completed
      .filter(s => s.assessmentId)
      .map(s => ({ assessmentId: s.assessmentId.toString(), solutionId: s._id.toString() }));
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default userRouter;
