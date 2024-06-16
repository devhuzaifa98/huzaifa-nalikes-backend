import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  users: {
    type: Map,
    of: {
      username: String,
      count: Number,
    },
    default: {},
  },
  startTime: { type: Number, default: null },
});

sessionSchema.statics.deleteExpiredSessions = async function () {
  const now = Date.now();
  const expiredSessions = await this.find({
    startTime: { $lte: now - 60 * 1000 },
  });
  const expiredSessionIds = expiredSessions.map((session) => session.id);
  await this.deleteMany({ id: { $in: expiredSessionIds } });

  return expiredSessions;
};

const Session = mongoose.model("Session", sessionSchema);
export default Session;
