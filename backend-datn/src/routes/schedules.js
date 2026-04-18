const router = require("express").Router();
const ctrl = require("../controllers/scheduleController");
const auth = require("../middleware/auth");

router.get("/", auth, ctrl.getAll);
router.post("/", auth, ctrl.create);
router.put("/:id", auth, ctrl.update);
router.patch("/:id/toggle", auth, ctrl.toggle);
router.delete("/:id", auth, ctrl.remove);
router.get("/logs", auth, ctrl.getLogs);

module.exports = router;
