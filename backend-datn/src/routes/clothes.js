const router = require('express').Router();
const ctrl   = require('../controllers/clothesController');
const auth   = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Clothes
 *   description: Hệ thống mái che quần áo tự động
 */

/**
 * @swagger
 * /api/clothes:
 *   get:
 *     summary: Lấy trạng thái mái che
 *     tags: [Clothes]
 *     responses:
 *       200:
 *         description: Trạng thái hiện tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clothes:
 *                   type: string
 *                   example: "IN"
 *                 rain:
 *                   type: boolean
 *                   example: false
 */
router.get('/', auth, ctrl.getStatus);

/**
 * @swagger
 * /api/clothes/cmd:
 *   post:
 *     summary: Gửi lệnh điều khiển mái che
 *     tags: [Clothes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cmd]
 *             properties:
 *               cmd:
 *                 type: string
 *                 enum: [IN, OUT, AUTO]
 *                 example: IN
 *     responses:
 *       200:
 *         description: Lệnh đã được gửi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Clothes IN sent"
 *       400:
 *         description: Lệnh không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid command"
 */
router.post('/cmd', auth, ctrl.sendCmd);

module.exports = router;