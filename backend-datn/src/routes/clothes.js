const router = require('express').Router();
const ctrl   = require('../controllers/clothesController');
const auth   = require('../middleware/auth');

router.get('/',      auth, ctrl.getStatus);
router.post('/cmd',  auth, ctrl.sendCmd);

module.exports = router;