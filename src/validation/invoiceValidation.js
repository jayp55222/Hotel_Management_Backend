const Joi = require('joi')
const invoiceValidationSchema = Joi.object({
    orderId: Joi.string().required(),
    paymentStatus: Joi.string().valid('Paid', 'Pending', 'Failed', 'Cancelled').default('Pending'),
    amount: Joi.number().min(0).required(),
    paymentMethod: Joi.string().optional(),
  })
module.exports = invoiceValidationSchema;