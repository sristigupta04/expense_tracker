const express = require("express");
const router = express.Router();

const {
  createSaving,
  getSavings,
  getSavingById,
  updateSaving,
  deleteSaving,
} = require("../controllers/savingController");

const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/", getSavings);
router.get("/:id", getSavingById);
router.post("/", createSaving);
router.put("/:id", updateSaving);
router.delete("/:id", deleteSaving);

module.exports = router;