const router = require('express').Router();
const ctrl   = require('../controllers/roomController');
const auth   = require('../middleware/auth');

router.get('/',            auth, ctrl.getStatus);
router.post('/fan',        auth, ctrl.fanCmd);
router.post('/living/led', auth, ctrl.livingLedCmd);
router.post('/bedroom/led',auth, ctrl.bedroomLedCmd);
router.post('/alert',      auth, ctrl.alertCmd);
router.get('/logs',        auth, ctrl.getLogs);

module.exports = router;