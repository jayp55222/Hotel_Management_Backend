const tableSchema=require("./hotelTable")
const superAdminSchema=require("./admin")
const menuItemSchema=require("./menuItem")
const orderSchema=require("./order")
const orderItemSchema=require("./orderItem")
const waiterSchema=require("./waiter")
const invoiceSchema=require("./Invoice")
tableSchema.belongsTo(superAdminSchema, { foreignKey: 'superAdminId' });
tableSchema.hasMany(orderSchema, { foreignKey: 'tableId' });
superAdminSchema.hasMany(tableSchema, { foreignKey: 'superAdminId' });
superAdminSchema.hasMany(menuItemSchema, { foreignKey: 'superAdminId' });
superAdminSchema.hasMany(waiterSchema, { foreignKey: 'superAdminId' });
menuItemSchema.belongsTo(superAdminSchema, { foreignKey: 'superAdminId' });
waiterSchema.belongsTo(superAdminSchema, { foreignKey: 'superAdminId' });
waiterSchema.hasMany(orderSchema, { foreignKey: 'waiterId' });
orderSchema.belongsTo(waiterSchema, { foreignKey: 'waiterId' });
orderSchema.belongsTo(tableSchema, { foreignKey: 'tableId' });
orderSchema.hasMany(orderItemSchema, { foreignKey: 'orderId' });
orderItemSchema.belongsTo(menuItemSchema, { foreignKey: 'menu_id' });
orderSchema.hasOne(invoiceSchema, { foreignKey: 'orderId' });
orderItemSchema.belongsTo(orderSchema, { foreignKey: 'orderId' });
menuItemSchema.hasMany(orderItemSchema, { foreignKey: 'menu_id' });
invoiceSchema.belongsTo(orderSchema, { foreignKey: 'orderId' });

module.exports = {  tableSchema,  superAdminSchema, menuItemSchema,  orderSchema,  orderItemSchema,  waiterSchema, invoiceSchema};


















