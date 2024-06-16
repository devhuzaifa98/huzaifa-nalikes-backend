import User from "../schema/User.js";
import { rewardWinner } from "../utils/web3.js";

const sessions = {};

const generateRandomSessionId = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const createSession = (sessionId, user) => {
  sessions[sessionId] = {
    id: sessionId,
    users: {},
    timer: null,
    startTime: null,
  };
  sessions[sessionId].users[user._id] = {
    username: user.username,
    count: 0,
  };
};

const getSession = (sessionId) => sessions[sessionId];

const getSessionResponse = (sessionId) => {
  const session = sessions[sessionId];
  return JSON.stringify({
    id: sessionId,
    users: session.users,
    startTime: session.startTime,
  });
};

const deleteSession = (sessionId) => {
  const timer = sessions[sessionId].timer;
  clearTimeout(timer);
  delete sessions[sessionId];
};

const handleJoin = async (io, socket, id, user) => {
  const sessionId = !id || id.length === 0 ? generateRandomSessionId() : id;
  if (!getSession(sessionId)) {
    createSession(sessionId, user);
  }
  socket.join(sessionId);
  getSession(sessionId).users[user._id] = {
    username: user.username,
    count: 0,
  };

  io.to(sessionId).emit("update", getSessionResponse(sessionId));
  io.to(sessionId).emit(
    "notification",
    `${user.username} has joined the game!`
  );
};

const handleDisconnect = (io, socket, user) => {
  for (const sessionId in sessions) {
    if (getSession(sessionId).users[user._id]) {
      const username = getSession(sessionId).users[user._id].username;

      delete getSession(sessionId).users[user._id];

      io.to(sessionId).emit("update", getSessionResponse(sessionId));
      io.to(sessionId).emit("notification", `${username} has left the game.`);

      if (Object.keys(getSession(sessionId).users).length === 0) {
        deleteSession(sessionId);
      }

      break;
    }
  }
};

const handleClick = (io, socket, sessionId, user) => {
  const session = getSession(sessionId);
  if (!session) return;

  if (!session.startTime) {
    session.startTime = Date.now();
    session.timer = setTimeout(() => endSession(io, sessionId), 60 * 1000); // 1 minute timer
  }

  session.users[user._id].count += 1;

  io.to(sessionId).emit("update", getSessionResponse(sessionId));
};

const endSession = async (io, sessionId) => {
  const session = getSession(sessionId);
  if (!session) return;

  let winner = Object.values(session.users).sort(
    (a, b) => b.count - a.count
  )[0];

  io.to(sessionId).emit("end", JSON.stringify({ winner }));
  io.to(sessionId).emit("notification", `${winner.username} has won the game!`);

  try {
    winner = await User.findOne({ username: winner.username });
    await rewardWinner(winner.address, "1000");
  } catch (error) {
    console.log("Error while rewarding ", winner.username);
  }

  deleteSession(sessionId);
};

export { handleDisconnect, handleJoin, handleClick, endSession };
