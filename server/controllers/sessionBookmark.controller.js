
import Session from "../models/session.model.js";
import SessionBookmark from "../models/sessionBookmark.model.js";

const bookmarkSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (req.user.role !== "attendee") {
      return res.status(403).json({
        message: "Only attendees can bookmark sessions",
      });
    }

    const existingBookmark = await SessionBookmark.findOne({
      attendee: req.user._id,
      session: sessionId,
    });

    if (existingBookmark) {
      return res.status(400).json({
        message: "You already bookmarked this session",
      });
    }

    const bookmark = await SessionBookmark.create({
      attendee: req.user._id,
      session: sessionId,
    });

    res.status(201).json({
      message: "Session bookmarked successfully",
      bookmark,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You already bookmarked this session",
      });
    }

    next(error);
  }
};

const removeBookmark = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (req.user.role !== "attendee") {
      return res.status(403).json({
        message: "Only attendees can remove bookmarks",
      });
    }

    const bookmark = await SessionBookmark.findOneAndDelete({
      attendee: req.user._id,
      session: sessionId,
    });

    if (!bookmark) {
      return res.status(404).json({
        message: "Bookmark not found",
      });
    }

    res.status(200).json({
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    next(error);
  }
};


const getMySchedule = async (req, res, next) => {
  try {
    if (req.user.role !== "attendee") {
      return res.status(403).json({
        message: "Only attendees can view their schedule",
      });
    }

    const bookmarks = await SessionBookmark.find({
      attendee: req.user._id,
    })
      .populate({
        path: "session",
        populate: {
          path: "event",
          select: "title location",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Schedule fetched successfully",
      schedule: bookmarks,
    });
  } catch (error) {
    next(error);
  }
};


const sessionBookmarkController = {
  bookmarkSession,
  removeBookmark,
  getMySchedule,
};

export default sessionBookmarkController;
