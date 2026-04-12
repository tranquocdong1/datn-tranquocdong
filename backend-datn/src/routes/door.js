const router = require('express').Router();
const ctrl   = require('../controllers/doorController');
const auth   = require('../middleware/auth');

router.get('/',           auth, ctrl.getStatus);
router.post('/cmd',       auth, ctrl.sendCmd);
router.get('/logs',       auth, ctrl.getLogs);
router.post('/uid/add',   auth, ctrl.addUID);
router.delete('/uid',     auth, ctrl.removeUID);
router.get('/uid/list',   auth, ctrl.listUID);

module.exports = router;