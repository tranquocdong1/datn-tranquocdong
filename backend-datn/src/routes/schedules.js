const router = require("express").Router();
const ctrl = require("../controllers/scheduleController");
const auth = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Lịch hẹn tự động hóa thiết bị
 */

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Lấy danh sách lịch hẹn
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "6801f9b2c3d4e5f6a7b8c9d0"
 *                   name:
 *                     type: string
 *                     example: "Bật đèn 7h tối"
 *                   device:
 *                     type: string
 *                     example: "living_led"
 *                   action:
 *                     type: string
 *                     example: "ON"
 *                   hour:
 *                     type: integer
 *                     example: 19
 *                   minute:
 *                     type: integer
 *                     example: 0
 *                   days:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     example: [1, 2, 3, 4, 5]
 *                   enabled:
 *                     type: boolean
 *                     example: true
 */
router.get("/", auth, ctrl.getAll);

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Tạo lịch hẹn mới
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [device, action, hour, minute, days]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Bật đèn 7h tối"
 *               device:
 *                 type: string
 *                 enum: [door, fan, living_led, bedroom_led, clothes]
 *                 example: "living_led"
 *               action:
 *                 type: string
 *                 example: "ON"
 *                 description: |
 *                   Giá trị hợp lệ theo device:
 *                   - door: OPEN, CLOSE
 *                   - fan: ON, OFF, AUTO
 *                   - living_led: ON, OFF, AUTO
 *                   - bedroom_led: ON, OFF, AUTO
 *                   - clothes: IN, OUT, AUTO
 *               hour:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 23
 *                 example: 19
 *               minute:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 59
 *                 example: 0
 *               days:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 6
 *                 example: [1, 2, 3, 4, 5]
 *                 description: "0=Chủ nhật, 1=Thứ 2, ..., 6=Thứ 7"
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Lịch hẹn đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "6801f9b2c3d4e5f6a7b8c9d0"
 *       400:
 *         description: Device/Action không hợp lệ hoặc thiếu days
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Action ON không hợp lệ cho thiết bị door"
 */
router.post("/", auth, ctrl.create);

/**
 * @swagger
 * /api/schedules/{id}:
 *   put:
 *     summary: Cập nhật lịch hẹn
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6801f9b2c3d4e5f6a7b8c9d0"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Bật đèn 7h tối"
 *               device:
 *                 type: string
 *                 enum: [door, fan, living_led, bedroom_led, clothes]
 *                 example: "living_led"
 *               action:
 *                 type: string
 *                 example: "ON"
 *               hour:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 23
 *                 example: 19
 *               minute:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 59
 *                 example: 0
 *               days:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 6
 *                 example: [1, 2, 3, 4, 5]
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Đã cập nhật
 *       400:
 *         description: Action không hợp lệ cho thiết bị
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Action không hợp lệ cho thiết bị này"
 *       404:
 *         description: Không tìm thấy lịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy lịch!"
 */
router.put("/:id", auth, ctrl.update);

/**
 * @swagger
 * /api/schedules/{id}/toggle:
 *   patch:
 *     summary: Bật/tắt nhanh lịch hẹn
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6801f9b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Đã toggle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Không tìm thấy lịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy lịch!"
 */
router.patch("/:id/toggle", auth, ctrl.toggle);

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: Xóa lịch hẹn
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6801f9b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Đã xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đã xóa lịch!"
 */
router.delete("/:id", auth, ctrl.remove);

/**
 * @swagger
 * /api/schedules/logs:
 *   get:
 *     summary: Lịch sử thực thi lịch hẹn
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 30
 *         description: Số lượng log muốn lấy (mặc định 30)
 *     responses:
 *       200:
 *         description: Danh sách logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   source:
 *                     type: string
 *                     example: "schedule"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/logs", auth, ctrl.getLogs);

module.exports = router;