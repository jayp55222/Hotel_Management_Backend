const tableSchema = require("./hotelTable");
const superAdminSchema = require('./superadmin')
const adminSchema = require("./admin");
const menuItemSchema = require("./menuItem");
const orderSchema = require("./order");
const orderItemSchema = require("./orderItem");
const waiterSchema = require("./waiter");
const invoiceSchema = require("./Invoice");
const customerSchema = require("./customer");
tableSchema.belongsTo(adminSchema, { foreignKey: "AdminId" });
tableSchema.hasMany(orderSchema, { foreignKey: "tableId" });
adminSchema.hasMany(tableSchema, { foreignKey: "AdminId" });
adminSchema.hasMany(menuItemSchema, { foreignKey: "AdminId" });
adminSchema.hasMany(waiterSchema, { foreignKey: "AdminId" });
menuItemSchema.belongsTo(adminSchema, { foreignKey: "AdminId" });
waiterSchema.belongsTo(adminSchema, { foreignKey: "AdminId" });
waiterSchema.hasMany(orderSchema, { foreignKey: "waiterId" });
orderSchema.belongsTo(waiterSchema, { foreignKey: "waiterId" });
orderSchema.belongsTo(tableSchema, { foreignKey: "tableId" });
orderSchema.hasMany(orderItemSchema, { foreignKey: "orderId" });
orderItemSchema.belongsTo(menuItemSchema, { foreignKey: "menu_id" });
orderSchema.hasOne(invoiceSchema, { foreignKey: "orderId" });
orderItemSchema.belongsTo(orderSchema, { foreignKey: "orderId" });
menuItemSchema.hasMany(orderItemSchema, { foreignKey: "menu_id" });
invoiceSchema.belongsTo(orderSchema, { foreignKey: "orderId" });

module.exports = {
  superAdminSchema,
  customerSchema,
  tableSchema,
  adminSchema,
  menuItemSchema,
  orderSchema,
  orderItemSchema,
  waiterSchema,
  invoiceSchema,
};
