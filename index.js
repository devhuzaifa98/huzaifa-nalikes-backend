import loadEnv from "./utils/loadEnv.js";
import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { router as authRouter } from "./routes/auth.route.js";
import http from "http";
import cors from "cors";
import User from "./schema/User.js";
import jwt from "jsonwebtoken";
import sessionHandler from "./socket/sessionHandler.js";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", async (socket) => {
  const auth = socket.handshake.headers?.authorization?.split(" ")[1];
  if (!auth) return socket.disconnect();
  const decoded = jwt.verify(auth, process.env.SECRET_KEY);
  if (!decoded) return socket.disconnect();
  const user = await User.findOne({ username: decoded.username }).lean();
  sessionHandler(io, socket, user);
});

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.static("dist"));
app.get("/", (_req, res) => {
  res.sendFile(path.resolve(process.cwd(), "dist/index.html"));
});
app.use("/api/auth", authRouter);

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
server.listen(4000, () => console.log("Server started"));
