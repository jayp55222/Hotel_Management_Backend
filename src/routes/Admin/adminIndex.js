const router = require('express').Router()
const adminRoute = require('./adminRoutes')

router.use('/', adminRoute)

module.exports = router