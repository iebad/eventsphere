import mongoose from "mongoose";

const attendeeRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name : {
        type : String,
        required : true
    }
  },
  { timestamps: true }
);


attendeeRegistrationSchema.index(
  { event: 1, attendee: 1 },
  { unique: true }
);

const AttendeeRegistration = mongoose.model(
  "AttendeeRegistration",
  attendeeRegistrationSchema
);

export default AttendeeRegistration;