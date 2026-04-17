const router = require("express").Router();
const ctrl = require("../controllers/authController");
const auth = require("../middleware/auth");

// router.post('/register', ctrl.register);
router.post("/login", ctrl.login);
router.get("/me", auth, ctrl.me);

router.post("/login", ctrl.login);
router.post("/verify-otp", ctrl.verifyOTP);
router.post("/resend-otp", ctrl.resendOTP);
router.get("/me", auth, ctrl.me);

module.exports = router;
