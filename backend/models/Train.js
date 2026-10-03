const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema(
    {
        trainNumber: {
            type: String,
            required: true,
            unique: true,
        },

        trainName: {
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

        departureTime: {
            type: String,
            required: true,
        },

        arrivalTime: {
            type: String,
            required: true,
        },

        fare: {
            type: Number,
            required: true,
        },

        availableSeats: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            default: "On Time",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Train", trainSchema);