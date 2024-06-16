import express from "express";
import { details, login, register } from "../controllers/auth.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";
const router = express.Router();

router
  .post("/register", register)
  .post("/login", login)
  .get("/", authorize, details)

export { router };
