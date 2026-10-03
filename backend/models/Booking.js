const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        trainId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Train",
            required: true,
        },

        passengerName: {
            type: String,
            required: true,
        },

        source: {
            type: String,
            required: true,
        },

        destination: {
            type: String,
            required: true,
        },

        journeyDate: {
            type: String,
            required: true,
        },

        fare: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            default: "Confirmed",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Booking", bookingSchema);