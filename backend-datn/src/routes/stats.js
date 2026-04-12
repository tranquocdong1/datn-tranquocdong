const router = require('express').Router();
const ctrl   = require('../controllers/statsController');
const auth   = require('../middleware/auth');

router.get('/overview',     auth, ctrl.getOverview);
router.get('/logs',         auth, ctrl.getLogs);
router.get('/access',       auth, ctrl.getAccessStats);
router.get('/temperature',  auth, ctrl.getTemperatureHistory);
router.get('/summary',      auth, ctrl.getSummary);

module.exports = router;