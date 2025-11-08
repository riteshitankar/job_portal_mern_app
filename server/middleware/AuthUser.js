import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userModel } from "../models/userSchema.js";

dotenv.config({ path: "./config.env" });

const AuthUser = async (req, res, next) => {
  try {
    let userToken = req.headers.authorization; // lowercase key

    if (!userToken) throw new Error("Token not found / invalid token!");

    const decoded = jwt.verify(userToken, process.env.JWT_SECRET_KEY);

    const user = await userModel.findOne({ "email.userEmail": decoded.email });
    if (!user) throw new Error("User not found!");
    if (!user.email.verified)
      throw new Error("Email not verified. Please verify first!");

    req.user = user;
    next();
  } catch (err) {
    console.log("Auth failed:", err.message);
    res.status(401).json({ message: "Unauthorized. Please login again." });
  }
};

export default AuthUser;
