const router = require('express').Router();
const ctrl   = require('../controllers/statsController');
const auth   = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Thống kê và lịch sử dữ liệu
 */

/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     summary: Trạng thái tất cả thiết bị hiện tại
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Toàn bộ DeviceState
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example: { "door": "CLOSE", "fan": "AUTO", "living": { "led": "ON" }, "bedroom": { "led": "OFF" }, "clothes": "IN", "rain": false }
 */
router.get('/overview', auth, ctrl.getOverview);

/**
 * @swagger
 * /api/stats/logs:
 *   get:
 *     summary: Lịch sử log có phân trang
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: device
 *         schema:
 *           type: string
 *           enum: [door, room, clothes]
 *         description: Lọc theo thiết bị
 *       - in: query
 *         name: event
 *         schema:
 *           type: string
 *           example: "access_granted"
 *         description: Lọc theo loại sự kiện
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 50
 *         description: Số log mỗi trang (mặc định 50)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Số trang (mặc định 1)
 *     responses:
 *       200:
 *         description: Danh sách logs có phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       device:
 *                         type: string
 *                         example: "door"
 *                       event:
 *                         type: string
 *                         example: "access_granted"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/logs', auth, ctrl.getLogs);

/**
 * @swagger
 * /api/stats/access:
 *   get:
 *     summary: Thống kê access granted/denied theo ngày
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           example: 7
 *         description: Số ngày gần nhất cần thống kê (mặc định 7)
 *     responses:
 *       200:
 *         description: Thống kê truy cập theo ngày
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     example: "2024-04-18"
 *                   granted:
 *                     type: integer
 *                     example: 5
 *                   denied:
 *                     type: integer
 *                     example: 2
 */
router.get('/access', auth, ctrl.getAccessStats);

/**
 * @swagger
 * /api/stats/temperature:
 *   get:
 *     summary: Lịch sử nhiệt độ/độ ẩm
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           example: 24
 *         description: Số giờ gần nhất (mặc định 24)
 *     responses:
 *       200:
 *         description: Dữ liệu nhiệt độ và độ ẩm theo thời gian
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   time:
 *                     type: string
 *                     format: date-time
 *                   temp:
 *                     type: number
 *                     example: 30.5
 *                   hum:
 *                     type: number
 *                     example: 70.2
 */
router.get('/temperature', auth, ctrl.getTemperatureHistory);

/**
 * @swagger
 * /api/stats/summary:
 *   get:
 *     summary: Tóm tắt thống kê hôm nay
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Tổng hợp lượt vào/ra, cảnh báo gas, xâm nhập trong ngày
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 granted:
 *                   type: integer
 *                   example: 10
 *                 denied:
 *                   type: integer
 *                   example: 2
 *                 gasAlerts:
 *                   type: integer
 *                   example: 0
 *                 intruders:
 *                   type: integer
 *                   example: 1
 *                 date:
 *                   type: string
 *                   format: date-time
 */
router.get('/summary', auth, ctrl.getSummary);

module.exports = router;