const router = require("express").Router();
const ctrl = require("../controllers/authController");
const auth = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Xác thực người dùng
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập (bước 1)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: |
 *           Nếu tắt 2FA → trả về token luôn.
 *           Nếu bật 2FA → trả về userId để dùng ở bước 2.
 *       401:
 *         description: Sai tên đăng nhập hoặc mật khẩu
 */
router.post("/login", ctrl.login);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Xác nhận OTP (bước 2)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, otp]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "6801f9b2c3d4e5f6a7b8c9d0"
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Xác thực thành công, trả về JWT token
 *       400:
 *         description: Thiếu userId hoặc OTP
 *       401:
 *         description: OTP không hợp lệ hoặc đã hết hạn
 */
router.post("/verify-otp", ctrl.verifyOTP);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Gửi lại OTP
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "6801f9b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Đã gửi lại OTP
 *       404:
 *         description: User không tồn tại
 */
router.post("/resend-otp", ctrl.resendOTP);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin user (không có password)
 *       401:
 *         description: Chưa xác thực
 */
router.get("/me", auth, ctrl.me);

module.exports = router;