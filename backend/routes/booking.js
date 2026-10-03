const express = require("express");
const Booking = require("../models/Booking");
const Train = require("../models/Train");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const {
            userId,
            trainId,
            passengerName,
            journeyDate,
        } = req.body;

        // Validate journey date
        if (!journeyDate) {
            return res.status(400).json({
                message: "Journey date is required",
            });
        }

        // Expected format: DD-MM-YYYY
        const dateParts = journeyDate.split("-");

        if (dateParts.length !== 3) {
            return res.status(400).json({
                message: "Invalid journey date",
            });
        }

        const day = Number(dateParts[0]);
        const month = Number(dateParts[1]);
        const year = Number(dateParts[2]);

        const selectedDate = new Date(
            year,
            month - 1,
            day
        );

        // Check that the date is actually valid
        if (
            selectedDate.getFullYear() !== year ||
            selectedDate.getMonth() !== month - 1 ||
            selectedDate.getDate() !== day
        ) {
            return res.status(400).json({
                message: "Invalid journey date",
            });
        }

        // Get today's date without time
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        // Prevent booking for a past date
        if (selectedDate < today) {
            return res.status(400).json({
                message: "Journey date cannot be in the past",
            });
        }

        const train = await Train.findById(trainId);

        if (!train) {
            return res.status(404).json({
                message: "Train not found",
            });
        }

        if (train.availableSeats <= 0) {
            return res.status(400).json({
                message: "No seats available",
            });
        }

        const booking = new Booking({
            userId,
            trainId,
            passengerName,
            source: train.source,
            destination: train.destination,
            journeyDate,
            fare: train.fare,
            status: "Confirmed",
        });

        await booking.save();

        train.availableSeats -= 1;
        await train.save();

        // Notify connected dashboard clients
        const io = req.app.get("io");

        if (io) {
            io.emit("bookingUpdated", {
                userId: userId.toString(),
                action: "created",
                booking: booking,
            });

            console.log(
                "Booking update sent through Socket.IO."
            );
        }

        res.status(201).json({
            message: "Booking successful",
            booking,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Booking failed",
        });
    }
});

router.get("/user/:userId", async (req, res) => {
    try {
        const bookings = await Booking.find({
            userId: req.params.userId,
        }).populate("trainId");

        res.json(bookings);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch bookings",
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found",
            });
        }

        const train = await Train.findById(booking.trainId);

        if (train) {
            train.availableSeats += 1;
            await train.save();
        }

        const userId = booking.userId;

        await Booking.findByIdAndDelete(req.params.id);

        // Notify connected dashboard clients
        const io = req.app.get("io");

        if (io) {
            io.emit("bookingUpdated", {
                userId: userId.toString(),
                action: "cancelled",
                bookingId: booking._id.toString(),
            });

            console.log(
                "Booking cancellation sent through Socket.IO."
            );
        }

        res.json({
            message: "Booking cancelled successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to cancel booking",
        });
    }
});

module.exports = router;