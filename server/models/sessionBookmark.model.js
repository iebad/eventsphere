
import mongoose from "mongoose";

const sessionBookmarkSchema = new mongoose.Schema(
  {
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    reminderEnabled: {
      type: Boolean,
      default: true,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

sessionBookmarkSchema.index(
  { attendee: 1, session: 1 },
  { unique: true }
);

const SessionBookmark = mongoose.model(
  "SessionBookmark",
  sessionBookmarkSchema
);

export default SessionBookmark;
