const express = require("express");
const Train = require("../models/Train");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const trains = await Train.find();
        res.json(trains);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch trains",
        });
    }
});

router.get("/search", async (req, res) => {
    try {
        const { source, destination } = req.query;

        const trains = await Train.find({
            source: { $regex: source, $options: "i" },
            destination: { $regex: destination, $options: "i" },
        });

        res.json(trains);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to search trains",
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const train = new Train(req.body);

        await train.save();

        res.status(201).json({
            message: "Train added successfully",
            train,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to add train",
        });
    }
});

router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        const train = await Train.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!train) {
            return res.status(404).json({
                message: "Train not found",
            });
        }

        console.log(
            `Train ${train.trainNumber} status changed to: ${train.status}`
        );

        // Find all bookings for this train
        const bookings = await Booking.find({
            trainId: train._id,
        });

        const io = req.app.get("io");

        // Keep track of users who have already received
        // a notification for this status change.
        const notifiedUsers = new Set();

        // Create only ONE notification per passenger
        for (const booking of bookings) {
            const userId = booking.userId.toString();

            if (notifiedUsers.has(userId)) {
                continue;
            }

            notifiedUsers.add(userId);

            const notification = new Notification({
                userId: booking.userId,
                message: `${train.trainName} (${train.trainNumber}) is now ${train.status}.`,
                type: "Train Status",
            });

            await notification.save();

            // Send notification live to connected passenger
            if (io) {
                io.emit("notificationCreated", notification);

                console.log(
                    `Notification sent to passenger ${userId}`
                );
            }
        }

        // Send live train status update
        if (io) {
            io.emit("trainStatusUpdated", {
                trainId: train._id.toString(),
                trainNumber: train.trainNumber,
                status: train.status,
                train: train,
            });

            console.log("Live train status update sent.");
        }

        res.json({
            message: "Train status updated successfully",
            train,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update train status",
        });
    }
});

module.exports = router;