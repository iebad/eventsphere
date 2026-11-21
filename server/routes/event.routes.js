import { Router } from "express";
import adminController from "../controllers/admin.controller.js";
import attendeeController from "../controllers/attendee.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/published",
  adminController.getPublishedEvents
);
router
.get("/:eventId",adminController.getPublicEventById);


router.post(
  "/:eventId/register",
  authMiddleware,
  attendeeController.registerForEvent
);

router.get(
  "/:eventId/registration-status",
  authMiddleware,
  attendeeController.checkRegistrationStatus
);

export default router;