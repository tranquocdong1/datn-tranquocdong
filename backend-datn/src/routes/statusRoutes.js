const express = require("express");
const router = express.Router();
const statusController = require("../controllers/statusController");

router.get("/current", statusController.getCurrentStatus);
router.get("/latest-sensors", statusController.getLatestSensors);

module.exports = router;