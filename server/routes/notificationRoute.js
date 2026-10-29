
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getNotifications);

router.get("/unread-count", authMiddleware, getUnreadCount);

router.patch("/read-all", authMiddleware, markAllNotificationsRead);

router.patch("/:id/read", authMiddleware, markNotificationRead);

router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;
