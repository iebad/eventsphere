
import { Router } from "express";
import sessionBookmarkController from "../controllers/sessionBookmark.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/:sessionId/bookmark",
  authMiddleware,
  sessionBookmarkController.bookmarkSession
);

router.delete(
  "/:sessionId/bookmark",
  authMiddleware,
  sessionBookmarkController.removeBookmark
);

router.get(
  "/my-schedule",
  authMiddleware,
  sessionBookmarkController.getMySchedule
);

export default router;
