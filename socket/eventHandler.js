import User from "../schema/User.js";
import { rewardWinner } from "../utils/web3.js";
import Session from "../schema/Session.js";


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

// Create a new session
const createSession = async (sessionId, user) => {
  const session = new Session({
    id: sessionId,
    users: {
      [user._id]: {
        username: user.username,
        count: 0,
      },
    },
  });
  await session.save();
};

// Get a session by its ID
const getSession = async (sessionId) => {
  return await Session.findOne({ id: sessionId });
};

// Get a response for the session
const getSessionResponse = (session) => {
  return JSON.stringify({
    id: session.id,
    users: session.users,
    startTime: session.startTime,
  });
};

// Handle user joining a session
const handleJoin = async (io, socket, id, user) => {
  const sessionId = !id || id.length === 0 ? generateRandomSessionId() : id;
  let session = await getSession(sessionId);
  if (!session) {
    await createSession(sessionId, user);
    session = await getSession(sessionId);
  }
  session.users.set(user._id, {
    username: user.username,
    count: 0,
  });
  await session.save();

  socket.join(sessionId);
  io.to(sessionId).emit("update", getSessionResponse(session));
  io.to(sessionId).emit(
    "notification",
    `${user.username} has joined the game!`
  );
};

// Handle user disconnecting from a session
const handleDisconnect = async (io, socket, user) => {
  // Find sessions where the user is present
  const sessions = await Session.find({
    [`users.${user._id.toString()}`]: { $exists: true },
  });
  for (const session of sessions) {
    const username = session.users.get(user._id).username;

    session.users.delete(user._id);
    await session.save();

    io.to(session.id).emit("update", getSessionResponse(session));
    io.to(session.id).emit("notification", `${username} has left the game.`);

    if (session.users.size === 0) {
      await Session.deleteOne({ id: session.id });
    }

    break;
  }
};

// Handle user clicking in a session
const handleClick = async (io, socket, sessionId, user) => {
  const session = await getSession(sessionId);
  if (!session) return;

  if (!session.startTime) {
    session.startTime = Date.now(); // current time in milliseconds
  }

  session.users.get(user._id).count += 1;
  await session.save();

  io.to(sessionId).emit("update", getSessionResponse(session));
};

// End a session
const endSession = async (io, session) => {
  let winner = Array.from(session.users.values()).sort(
    (a, b) => b.count - a.count
  )[0];

  io.to(session.id).emit("end", JSON.stringify({ winner }));
  io.to(session.id).emit(
    "notification",
    `${winner.username} has won the game!`
  );

  try {
    const winnerUser = await User.findOne({ username: winner.username });
    rewardWinner(winnerUser.address, "1000");
  } catch (error) {
    console.log("Error while rewarding ", winner.username);
  }
};

const startGlobalTimer = (io) => {
  setInterval(async () => {
    const expiredSessions = await Session.deleteExpiredSessions();
    for (const session of expiredSessions) {
      endSession(io, session);
    }
  }, 1000);
};

export {
  handleDisconnect,
  handleJoin,
  handleClick,
  endSession,
  startGlobalTimer,
};
