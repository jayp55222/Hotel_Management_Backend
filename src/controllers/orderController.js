const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Table = require("../models/hotelTable");
const Menu = require("../models/menuItem");
const Waiter = require("../models/waiter");
const Invoice = require("../models/Invoice");
const { successResponse, errorResponse } = require("../utils/responseFormat");

const placeOrder = async (req, res) => {
  try {
    const { tableId, waiterId, customer_name, customer_mobile, items } = req.body;

    const table = await Table.findByPk(tableId);
    if (!table || table.reservationStatus !== "available") {
      return errorResponse(res, null, "Table is not available.", 400);
    }

    const waiter = await Waiter.findByPk(waiterId);
    if (!waiter) {
      return errorResponse(res, null, "Waiter does not exist.", 400);
    }

    let totalAmount = 0;
    for (const item of items) {
      const menuItem = await Menu.findByPk(item.menu_id);
      if (!menuItem || !menuItem.isAvailable) {
        return errorResponse(res, null, `Menu item with ID ${item.menu_id} is not available.`, 400);
      }
      totalAmount += menuItem.price * item.quantity;
    }

    const date = new Date();
    const order_id = `O${customer_mobile.slice(-4)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}`;

    const order = await Order.create({
      id: order_id,
      tableId,
      waiterId,
      customer_name,
      customer_mobile,
      status: "Pending",
    });

    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        menu_id: item.menu_id,
        quantity: item.quantity,
      });
    }

    await table.update({ is_occupied: true, reservationStatus: "reserved" });

    await Invoice.create({
      orderId: order.id,
      amount: totalAmount,
      paymentStatus: "Pending",
    });

    return successResponse(res, order, "Order placed successfully.", 201);
  } catch (error) {
    return errorResponse(res, error, "Internal server error.");
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ include: [OrderItem] });
    return successResponse(res, orders, "Orders fetched successfully.");
  } catch (error) {
    return errorResponse(res, error, "Internal server error.");
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, { include: [OrderItem, Table, Waiter] });
    if (!order) {
      return errorResponse(res, null, "Order not found.", 404);
    }
    return successResponse(res, order, "Order fetched successfully.");
  } catch (error) {
    return errorResponse(res, error.message, "Internal server error.");
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, items } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return errorResponse(res, null, "Order not found.", 404);
    }

    if (status) {
      if (!["Pending", "Delivered"].includes(status)) {
        return errorResponse(res, null, "Invalid status.", 400);
      }
      await order.update({ status });

      if (status === "Delivered") {
        const invoice = await Invoice.findOne({ where: { orderId: id } });
        if (!invoice) {
          return errorResponse(res, null, "Invoice not found for this order.", 404);
        }
        if (invoice.paymentStatus === "Paid") {
          const table = await Table.findByPk(order.tableId);
          if (table) {
            await table.update({ is_occupied: false, reservationStatus: "available" });
          }
        }
      }
    }

    if (items && Array.isArray(items)) {
      await OrderItem.destroy({ where: { orderId: order.id } });

      for (const item of items) {
        const menuItem = await Menu.findByPk(item.menu_id);
        if (!menuItem || !menuItem.isAvailable) {
          return errorResponse(res, null, `Menu item with ID ${item.menu_id} is not available.`, 400);
        }

        await OrderItem.create({
          orderId: order.id,
          menu_id: item.menu_id,
          quantity: item.quantity,
        });
      }

      let totalAmount = 0;
      for (const item of items) {
        const menuItem = await Menu.findByPk(item.menu_id);
        if (menuItem) {
          totalAmount += menuItem.price * item.quantity;
        }
      }

      const invoice = await Invoice.findOne({ where: { orderId: order.id } });
      if (invoice) {
        await invoice.update({ amount: totalAmount });
      }
    }

    return successResponse(res, order, "Order details s updated successfully.");
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return errorResponse(res, error.message, "Duplicate entry error.", 409);
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return errorResponse(res, error.message, "Foreign key constraint error.", 404);
    }
    return errorResponse(res, error.message, "Internal server error.");
  }
};
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order) {
      return errorResponse(res, null, "Order not found.", 404);
    }

    await OrderItem.destroy({ where: { orderId: id } });
    await Invoice.destroy({ where: { orderId: id } });

    const table = await Table.findByPk(order.tableId);
    if (table) {
      await table.update({ is_occupied: false, reservationStatus: "available" });
    }

    await order.destroy();

    return successResponse(res, null, "Order deleted successfully along with related data.");
  } catch (error) {
    return errorResponse(res, error.message, "Internal server error.");
  }
};

const getOrdersByTableId = async (req, res) => {
  try {
    const { tableId } = req.params;
    const orders = await Order.findAll({ where: { tableId }, include: [OrderItem] });
    return successResponse(res, orders, "Orders fetched successfully.");
  } catch (error) {
    return errorResponse(res, error.message, "Internal server error.");
  }
};

const getOrdersByWaiterId = async (req, res) => {
  try {
    const { waiterId } = req.params;
    const orders = await Order.findAll({ where: { waiterId }, include: [OrderItem] });
    return successResponse(res, orders, "Orders fetched successfully.");
  } catch (error) {
    return errorResponse(res, error.message, "Internal server error.");
  }
};

const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await Order.findAll({ where: { status }, include: [OrderItem] });
    return successResponse(res, orders, "Orders fetched successfully.");
  } catch (error) {
    return errorResponse(res, error.message, "Internal server error.");
  }
};

const getOrdersByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.findAll({ where: { customerId }, include: [OrderItem] });
    return successResponse(res, orders, "Orders fetched successfully.");
  } catch (error) {
    return errorResponse(res, error.message, "Internal server error.");
  }
};

module.exports = {placeOrder,getAllOrders,getOrderById,updateOrderStatus,deleteOrder,getOrdersByTableId,getOrdersByWaiterId,getOrdersByStatus,getOrdersByCustomerId};
