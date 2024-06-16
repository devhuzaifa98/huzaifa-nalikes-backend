import {
  handleClick,
  handleDisconnect,
  handleJoin,
  startGlobalTimer,
} from "./eventHandler.js";

const sessionHandler = (io, socket, user) => {
  startGlobalTimer(io);
  socket.on("join-session", (id) => handleJoin(io, socket, id, user));
  socket.on("click", (id) => handleClick(io, socket, id, user));
  socket.on("disconnect", () => handleDisconnect(io, socket, user));
};

export default sessionHandler;
