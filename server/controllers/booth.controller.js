
import Event from "../models/event.model.js";
import ExhibitorProfile from "../models/exhibitorProfile.model.js";
import Booth from "../models/booth.model.js";
import Application from "../models/application.model.js";

// Check whether admin can manage this event
const getManageableEvent = async (eventId, user) => {
  if (!user || user.role !== "admin") {
    return null;
  }

  const event = await Event.findById(eventId);

  return event;
};

// Create booth
const createBooth = async (req, res, next) => {
  try {
    const event = await getManageableEvent(
      req.params.eventId,
      req.user
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or access denied",
      });
    }

    const { boothNumber, size, price, row, column } = req.body;

    if (!boothNumber?.trim() || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Booth number and price are required",
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    const numericRow = Number(row);
const numericColumn = Number(column);

if (
  row === undefined ||
  row === null ||
  row === "" ||
  column === undefined ||
  column === null ||
  column === "" ||
  !Number.isInteger(numericRow) ||
  !Number.isInteger(numericColumn) ||
  numericRow < 1 ||
  numericColumn < 1
) {
  return res.status(400).json({
    success: false,
    message: "Valid row and column numbers are required",
  });
}

    const booth = await Booth.create({
      event: event._id,
      boothNumber: boothNumber.trim(),
      size: size || "medium",
      price: numericPrice,
      row: numericRow,
      column: numericColumn,
    });

    return res.status(201).json({
      success: true,
      message: "Booth created successfully",
      booth,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This booth number already exists for this event",
      });
    }

    next(error);
  }
};

// Admin: Get all booths of an event
const getBooths = async (req, res, next) => {
  try {
    const event = await getManageableEvent(
      req.params.eventId,
      req.user
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or access denied",
      });
    }

    // Get booths and populate the assigned user
    const booths = await Booth.find({
      event: event._id,
    })
      .populate("assignedTo", "username name")
      .sort({ boothNumber: 1 });

    // Get company name from ExhibitorProfile
    const boothsWithProfile = await Promise.all(
      booths.map(async (booth) => {
        const boothObject = booth.toObject();

        if (booth.assignedTo) {
          const profile = await ExhibitorProfile.findOne({
            exhibitor: booth.assignedTo._id,
          }).select("companyName");

          boothObject.assignedTo.companyName =
            profile?.companyName || "Not provided";
        }

        return boothObject;
      })
    );

    return res.status(200).json({
      success: true,
      count: boothsWithProfile.length,
      booths: boothsWithProfile,
    });

  } catch (error) {
    next(error);
  }
};
// Exhibitor: Get available booths
const getAvailableBooths = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const application = await Application.findOne({
      event: eventId,
      exhibitor: req.user._id,
      status: "approved",
    });

    if (!application) {
      return res.status(403).json({
        success: false,
        message: "Your application must be approved first",
      });
    }

    const booths = await Booth.find({
      event: eventId,
      status: "available",
      assignedTo: null,
    }).sort({ boothNumber: 1 });

    return res.status(200).json({
      success: true,
      count: booths.length,
      booths,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update booth
const updateBooth = async (req, res, next) => {
  try {
    const event = await getManageableEvent(
      req.params.eventId,
      req.user
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or access denied",
      });
    }

    const { boothNumber, size, price, row, column } = req.body;
    const updates = {};

    if (boothNumber !== undefined) {
      if (typeof boothNumber !== "string" || !boothNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: "Booth number cannot be empty",
        });
      }

      updates.boothNumber = boothNumber.trim();
    }

    if (size !== undefined) {
      if (!["small", "medium", "large"].includes(size)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booth size",
        });
      }

      updates.size = size;
    }

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number",
        });
      }

      updates.price = numericPrice;
    }

    if (row !== undefined) {
  const numericRow = Number(row);

  if (
    row === null ||
    row === "" ||
    !Number.isInteger(numericRow) ||
    numericRow < 1
  ) {
    return res.status(400).json({
      success: false,
      message: "Row must be a positive whole number",
    });
  }

  updates.row = numericRow;
}

if (column !== undefined) {
  const numericColumn = Number(column);

  if (
    column === null ||
    column === "" ||
    !Number.isInteger(numericColumn) ||
    numericColumn < 1
  ) {
    return res.status(400).json({
      success: false,
      message: "Column must be a positive whole number",
    });
  }

  updates.column = numericColumn;
}

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    const booth = await Booth.findOneAndUpdate(
      {
        _id: req.params.boothId,
        event: event._id,
      },
      { $set: updates },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: "Booth not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booth updated successfully",
      booth,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This booth number already exists for this event",
      });
    }

    next(error);
  }
};

// Admin: Delete booth
const deleteBooth = async (req, res, next) => {
  try {
    const event = await getManageableEvent(
      req.params.eventId,
      req.user
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or access denied",
      });
    }

    const booth = await Booth.findOne({
      _id: req.params.boothId,
      event: event._id,
    });

    if (!booth) {
      return res.status(404).json({
        success: false,
        message: "Booth not found",
      });
    }

    if (booth.status !== "available" || booth.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Reserved or occupied booths cannot be deleted",
      });
    }

    const linkedApplication = await Application.findOne({
      booth: booth._id,
    });

    if (linkedApplication) {
      return res.status(400).json({
        success: false,
        message: "This booth is linked to an application and cannot be deleted",
      });
    }

    await booth.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Booth deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Exhibitor: Reserve an available booth
const reserveBooth = async (req, res, next) => {
  let reservedBooth = null;

  try {
    const { eventId, boothId } = req.params;
    const exhibitorId = req.user._id;

    // 1. Check event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // 2. Find exhibitor application
    const application = await Application.findOne({
      event: eventId,
      exhibitor: exhibitorId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "You have not applied for this event",
      });
    }

    // 3. Application must be approved
    if (application.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your application must be approved first",
      });
    }

    // 4. Prevent multiple reservations
    if (application.booth) {
      return res.status(400).json({
        success: false,
        message: "You have already reserved a booth for this event",
      });
    }

    // 5. Atomically reserve booth
    reservedBooth = await Booth.findOneAndUpdate(
      {
        _id: boothId,
        event: eventId,
        status: "available",
        assignedTo: null,
      },
      {
        $set: {
          status: "reserved",
          assignedTo: exhibitorId,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!reservedBooth) {
      return res.status(409).json({
        success: false,
        message: "This booth is no longer available",
      });
    }

    // 6. Link booth with application
    const updatedApplication = await Application.findOneAndUpdate(
      {
        _id: application._id,
        status: "approved",
        booth: null,
      },
      {
        $set: {
          booth: reservedBooth._id,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    // 7. Rollback if application update fails
    if (!updatedApplication) {
      await Booth.findOneAndUpdate(
        {
          _id: reservedBooth._id,
          event: eventId,
          assignedTo: exhibitorId,
          status: "reserved",
        },
        {
          $set: {
            status: "available",
            assignedTo: null,
          },
        }
      );

      reservedBooth = null;

      return res.status(409).json({
        success: false,
        message: "Reservation could not be completed. Please try again.",
      });
    }

    // 8. Successful reservation
    return res.status(200).json({
      success: true,
      message: "Booth reserved successfully!",
      booth: reservedBooth,
      application: updatedApplication,
    });

  } catch (error) {
    // Rollback booth if an error occurs
    if (reservedBooth) {
      try {
        await Booth.findOneAndUpdate(
          {
            _id: reservedBooth._id,
            assignedTo: req.user._id,
            status: "reserved",
          },
          {
            $set: {
              status: "available",
              assignedTo: null,
            },
          }
        );
      } catch (rollbackError) {
        console.error("Booth rollback error:", rollbackError);
      }
    }

    next(error);
  }
};

const getExhibitorFloorPlan = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const exhibitorId = req.user._id;

    // Check whether the exhibitor has an approved application
    const application = await Application.findOne({
      event: eventId,
      exhibitor: exhibitorId,
      status: "approved",
    });

    if (!application) {
      return res.status(403).json({
        success: false,
        message: "You must have an approved application to view the floor plan",
      });
    }

    // Get all booths for this event
    const booths = await Booth.find({
      event: eventId,
    })
      .populate("assignedTo", "username name");

    // Add company names and identify the exhibitor's booth
    const boothsWithDetails = await Promise.all(
      booths.map(async (booth) => {
        const boothObject = booth.toObject();

        if (booth.assignedTo) {
          const profile = await ExhibitorProfile.findOne({
            exhibitor: booth.assignedTo._id,
          }).select("companyName");

          boothObject.assignedTo.companyName =
            profile?.companyName || "Not provided";
        }

        boothObject.isMyBooth =
          booth.assignedTo?._id.toString() === exhibitorId.toString();

        return boothObject;
      })
    );

    return res.status(200).json({
      success: true,
      booths: boothsWithDetails,
      reservedBooth: application.booth,
      hasReservedBooth: Boolean(application.booth),
    });

  } catch (error) {
    next(error);
  }
};

// Export controller
const boothController = {
  getManageableEvent,
  createBooth,
  getBooths,
  getAvailableBooths,
  reserveBooth,
  updateBooth,
  deleteBooth,
  getExhibitorFloorPlan,
};

export default boothController;
