const router = require('express').Router();
const ctrl   = require('../controllers/roomController');
const auth   = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Room
 *   description: Điều khiển thiết bị trong phòng
 */

/**
 * @swagger
 * /api/room:
 *   get:
 *     summary: Lấy trạng thái phòng
 *     tags: [Room]
 *     responses:
 *       200:
 *         description: Trạng thái phòng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room:
 *                   type: object
 *                   example: { "temperature": 30, "humidity": 70 }
 *                 living:
 *                   type: object
 *                   example: { "led": "ON" }
 *                 bedroom:
 *                   type: object
 *                   example: { "led": "OFF" }
 */
router.get('/', auth, ctrl.getStatus);

/**
 * @swagger
 * /api/room/fan:
 *   post:
 *     summary: Điều khiển quạt
 *     tags: [Room]
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
 *                 enum: [ON, OFF, AUTO]
 *                 example: ON
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
 *                   example: "Fan ON sent"
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
router.post('/fan', auth, ctrl.fanCmd);

/**
 * @swagger
 * /api/room/living/led:
 *   post:
 *     summary: Điều khiển đèn LED phòng khách
 *     tags: [Room]
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
 *                 enum: [ON, OFF, AUTO]
 *                 example: ON
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
 *                   example: "Living LED ON sent"
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
router.post('/living/led', auth, ctrl.livingLedCmd);

/**
 * @swagger
 * /api/room/bedroom/led:
 *   post:
 *     summary: Điều khiển đèn LED phòng ngủ
 *     tags: [Room]
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
 *                 enum: [ON, OFF, AUTO]
 *                 example: ON
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
 *                   example: "Bedroom LED ON sent"
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
router.post('/bedroom/led', auth, ctrl.bedroomLedCmd);

/**
 * @swagger
 * /api/room/alert:
 *   post:
 *     summary: Gửi cảnh báo buzzer
 *     tags: [Room]
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
 *                 enum: [INTRUDER, OFF]
 *                 example: INTRUDER
 *     responses:
 *       200:
 *         description: Cảnh báo đã được gửi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Alert INTRUDER sent"
 */
router.post('/alert', auth, ctrl.alertCmd);

/**
 * @swagger
 * /api/room/logs:
 *   get:
 *     summary: Lấy lịch sử hoạt động phòng và bảo mật
 *     tags: [Room]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 50
 *         description: Số lượng log muốn lấy (mặc định 50)
 *     responses:
 *       200:
 *         description: Danh sách log
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   device:
 *                     type: string
 *                     example: "room"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/logs', auth, ctrl.getLogs);

module.exports = router;