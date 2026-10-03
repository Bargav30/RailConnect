const express = require("express");
const Notification = require("../models/Notification");

const router = express.Router();

// Get notifications for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.params.userId,
        }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch notifications",
        });
    }
});

// Mark a notification as read
router.patch("/:id/read", async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
            });
        }

        res.json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update notification",
        });
    }
});

module.exports = router;