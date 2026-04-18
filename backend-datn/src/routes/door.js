const router = require('express').Router();
const ctrl   = require('../controllers/doorController');
const auth   = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Door
 *   description: Quản lý cửa và RFID
 */

/**
 * @swagger
 * /api/door:
 *   get:
 *     summary: Lấy trạng thái cửa hiện tại
 *     tags: [Door]
 *     responses:
 *       200:
 *         description: Trạng thái cửa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 door:
 *                   type: string
 *                   example: "OPEN"
 */
router.get('/', auth, ctrl.getStatus);

/**
 * @swagger
 * /api/door/cmd:
 *   post:
 *     summary: Gửi lệnh điều khiển cửa
 *     tags: [Door]
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
 *                 enum: [OPEN, CLOSE]
 *                 example: OPEN
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
 *                   example: "Command OPEN sent"
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

/**
 * @swagger
 * /api/door/logs:
 *   get:
 *     summary: Lấy lịch sử ra vào
 *     tags: [Door]
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
 *                     example: "door"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/logs', auth, ctrl.getLogs);

/**
 * @swagger
 * /api/door/uid/add:
 *   post:
 *     summary: Thêm UID thẻ RFID (hoặc bật chế độ learn)
 *     tags: [Door]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *                 example: "83:15:ce:06"
 *                 description: UID thẻ RFID (bỏ qua nếu dùng mode learn)
 *               mode:
 *                 type: string
 *                 enum: [learn]
 *                 example: "learn"
 *                 description: Truyền "learn" để bật chế độ học thẻ
 *     responses:
 *       200:
 *         description: UID đã được thêm hoặc chế độ learn đã bật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Add UID 83:15:ce:06 sent"
 *       400:
 *         description: Thiếu UID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "UID required"
 */
router.post('/uid/add', auth, ctrl.addUID);

/**
 * @swagger
 * /api/door/uid:
 *   delete:
 *     summary: Xóa UID thẻ RFID
 *     tags: [Door]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [uid]
 *             properties:
 *               uid:
 *                 type: string
 *                 example: "83:15:ce:06"
 *     responses:
 *       200:
 *         description: UID đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Remove UID 83:15:ce:06 sent"
 *       400:
 *         description: Thiếu UID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "UID required"
 */
router.delete('/uid', auth, ctrl.removeUID);

/**
 * @swagger
 * /api/door/uid/list:
 *   get:
 *     summary: Yêu cầu danh sách UID đã đăng ký
 *     tags: [Door]
 *     responses:
 *       200:
 *         description: Đã gửi yêu cầu lấy danh sách UID qua MQTT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "UID list requested"
 */
router.get('/uid/list', auth, ctrl.listUID);

module.exports = router;