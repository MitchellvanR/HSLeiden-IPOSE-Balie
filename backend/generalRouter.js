const router = require('express').Router();

router.use('/review', require('./resources/ReviewResource'));
router.use('/assignments', require('./resources/AssignmentResource'));
router.use('/auth', require('./resources/AuthResource'));

module.exports = router;