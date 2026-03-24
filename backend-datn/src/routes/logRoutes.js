const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");

router.get("/sensors", logController.getSensorLogs);
router.get("/controls", logController.getControlLogs);
router.get("/access", logController.getAccessLogs);

module.exports = router;