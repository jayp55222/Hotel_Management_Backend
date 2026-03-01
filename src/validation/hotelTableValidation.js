const Joi = require('joi');

const tableValidationSchema = Joi.object({
  tableNumber: Joi.string().required(),
  reservationStatus: Joi.string().valid('reserved', 'available').default('available'),
  seats: Joi.number().integer().min(1).required(),
  is_occupied: Joi.boolean().default(false),
  superAdminId: Joi.string().uuid().required(),
});

module.exports = { tableValidationSchema };
