const router = require('express').Router()
const superadmincrudRoute = require('./superAdmin')

router.use('/', superadmincrudRoute)

module.exports = router