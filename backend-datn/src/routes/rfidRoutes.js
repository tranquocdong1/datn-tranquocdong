const express = require("express");
const router = express.Router();
const rfidController = require("../controllers/rfidController");

router.post("/learn", rfidController.learnCard);
router.post("/add", rfidController.addCard);
router.post("/remove", rfidController.removeCard);
router.post("/sync", rfidController.syncCardList);
router.get("/list", rfidController.getCards);

module.exports = router;