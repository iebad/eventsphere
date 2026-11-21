
import Event from "../models/event.model.js";
import AttendeeRegistration from "../models/attendeeRegistration.model.js";

const registerForEvent = async (req, res, next) => {
  try {
    const name = req.user.username;
    const { eventId } = req.params;
    const attendeeId = req.user._id;

    // Only attendees can register
    if (req.user.role !== "attendee") {
      return res.status(403).json({
        success: false,
        message: "Only attendees can register for events",
      });
    }

    // Check if event exists and is published
    const event = await Event.findOne({
      _id: eventId,
      status: "published",
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or not published",
      });
    }

    // Check existing registration
    const existingRegistration = await AttendeeRegistration.findOne({
      event: eventId,
      attendee: attendeeId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    // Save registration
    const registration = await AttendeeRegistration.create({
      name,
      event: eventId,
      attendee: attendeeId,
    });

    return res.status(201).json({
      success: true,
      message: "Successfully registered for the event",
      registration,
    });
  } catch (error) {
    // Handle duplicate registration index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    next(error);
  }
};

const checkRegistrationStatus = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const registration = await AttendeeRegistration.findOne({
      event: eventId,
      attendee: req.user._id,
    });

    res.status(200).json({
      isRegistered: !!registration,
    });
  } catch (error) {
    next(error);
  }
};

const attendeeController = {
  registerForEvent,
  checkRegistrationStatus
};

export default attendeeController;
