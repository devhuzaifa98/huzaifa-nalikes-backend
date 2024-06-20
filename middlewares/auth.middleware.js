import jwt from "jsonwebtoken";
import User from "../schema/User.js";

export const authorize = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Token Required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { username } = decoded;

    const user = await User.findOne({ username });

    if (!user) {
      throw new Error("Invalid Token");
    }

    req.body.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};
