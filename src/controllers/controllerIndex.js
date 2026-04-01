const adminController = require('./Admin/adminIndex')
const superadminController = require('./superAdmin/index')

module.exports = {
    ...adminController,
    superadminController
}
