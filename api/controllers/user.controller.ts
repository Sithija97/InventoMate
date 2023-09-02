import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { generateToken } from "../utils/generateToken.util.js";

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error(`Please fill in all required fields`);
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error(`Password must be upto 6 characters`);
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    generateToken(res, _id);
    res.status(201).json({ _id, name, email, photo, phone, bio });
  } else {
    res.status(400);
    throw new Error(`Invalid user data`);
  }
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (passwordIsCorrect) {
    generateToken(res, user._id);
  }
  if (user && passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user;
    res.json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
    });
  } else {
    res.status(401);
    throw new Error("Invalid user data");
  }
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

const getUser = asyncHandler(async (req: Request, res: Response) => {});

const updateUser = asyncHandler(async (req: Request, res: Response) => {});

const getLoginStatus = asyncHandler(async (req: Request, res: Response) => {});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  getLoginStatus,
};