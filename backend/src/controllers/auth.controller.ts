import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginInput, RegisterInput } from "../types/auth";
import admin from "../config/firebase";

const JWT_SECRET: any = "process.env.JWT_SECRET!;";
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined");

export const register = async (req: any, res: any): Promise<any> => {
  try {
    const { idToken, email, name }: any = req.body as any;

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const phone = decodedToken.phone_number;
    const existingUser: any = await prisma.user.findUnique({
      where: { phone },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    // const hashedPassword: any = await bcrypt.hash(password, 10);

    const user: any = await prisma.user.create({
      data: {
        email,
        // password: hashedPassword,
        phone,
        name,
      },
    });

    const token: any = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req: any, res: any): Promise<any> => {
  try {
    const { idToken }: any = req.body as any;

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const phone = decodedToken.phone_number;

    const user: any = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // const isMatch: any = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res.status(400).json({ message: "Invalid email or password" });
    // }

    const token: any = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
