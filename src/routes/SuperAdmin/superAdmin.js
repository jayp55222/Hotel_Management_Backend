const express = require('express')
const router = express.Router()
const Controller = require('../../controllers/controllerIndex')

router.post('/', Controller.superadminController.superAdminCrudcontroller.createSuperAdmin)

module.exports = router