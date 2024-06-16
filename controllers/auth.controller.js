import User from "../schema/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { username, address, password } = req.body;
  const user = new User({
    username,
    password,
    address,
  });
  const error = user.validateSync();
  if (error)
    return res.json({
      success: false,
      message: error,
    });

  const hashed_password = await bcrypt.hash(password, 10);
  user.password = hashed_password;
  try {
    await user.save();
  } catch (err) {
    let message = err.errmsg || "Unknown error";
    if (err.code === 11000)
      message = `${Object.keys(err.keyValue)[0]} already exists`;
    return res.json({
      success: false,
      message,
    });
  }

  const token = jwt.sign({ username, address }, process.env.SECRET_KEY);

  return res.json({
    success: true,
    data: token,
  });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user)
    return res.json({ success: false, message: "Please enter valid username" });
  if (!bcrypt.compareSync(password, user.password))
    return res.json({ success: false, message: "Please enter valid password" });

  const token = jwt.sign(
    { username: user.username, address: user.address },
    process.env.SECRET_KEY
  );

  return res.json({ success: true, data: token });
};

export const details = async (req, res) => {
  return res.json({ success: true, data: req.body.user });
};
