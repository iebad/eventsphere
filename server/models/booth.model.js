import mongoose from "mongoose";

const boothSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    boothNumber: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["available", "reserved", "occupied"],
      default: "available",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    row : {
      type : Number,
      required : true,
      min : 1
    },
    column : {
      type : Number,
      required : true,
      min : 1
    },
  },
  { timestamps: true }
);

boothSchema.index(
  { event: 1, boothNumber: 1 },
  { unique: true }
);

boothSchema.index(
  { event: 1, row: 1, column: 1 },
  { unique: true }
);

const Booth = mongoose.model("Booth", boothSchema);

export default Booth;
