const express = require("express");
const router = express.Router();
const controlController = require("../controllers/controlController");

router.post("/door/open", controlController.openDoor);
router.post("/door/close", controlController.closeDoor);

router.post("/clothes/in", controlController.clothesIn);
router.post("/clothes/out", controlController.clothesOut);
router.post("/clothes/auto", controlController.clothesAuto);

router.post("/led/:room", controlController.controlLED);
router.post("/room/fan", controlController.controlFan);

router.post("/alert/buzzer/off", controlController.turnOffAlertBuzzer);

module.exports = router;