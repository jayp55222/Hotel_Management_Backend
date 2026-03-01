const Joi = require('joi');

const orderItemSchema = Joi.object({
  menu_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const placeOrderSchema = Joi.object({
  tableId: Joi.string().uuid().required(),
  waiterId: Joi.string().uuid().required(),
  customer_name: Joi.string().min(1).required(),
  customer_mobile: Joi.string().min(10).max(15).required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
});


module.exports = { placeOrderSchema };
