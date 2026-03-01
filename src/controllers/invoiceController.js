const PDFDocument = require("pdfkit");
const { invoiceSchema, orderSchema, orderItemSchema, menuItemSchema, tableSchema } = require("../models");
const fs = require('fs');
const path = require('path');
const Invoice=require("../models/Invoice")
const Order=require("../models/order")
const Table=require("../models/hotelTable")
const generateInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await invoiceSchema.findOne({
      where: { id: invoiceId },
      include: [
        {
          model: orderSchema,
          include: [
            { model: orderItemSchema, include: [{ model: menuItemSchema }] },
            { model: tableSchema },
          ],
        },
      ],
    });

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const invoicesDir = path.join(__dirname, "../invoices");
    if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

    const doc = new PDFDocument();
    const filePath = path.join(invoicesDir, `invoice-${invoice.id}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).font("Helvetica-Bold").text("Invoice", { align: "center" });
    doc.fontSize(12).text(`Invoice ID: ${invoice.id}`);
    doc.text(`Order ID: ${invoice.orderId}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").text("Customer Information:");
    doc.font("Helvetica").text(`Name: ${invoice.Order.customer_name}`);
    doc.text(`Phone: ${invoice.Order.customer_mobile}`);
    doc.text(`Table: ${invoice.Order.Table ? invoice.Order.Table.tableNumber : "Not Available"}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").text("Order Items:");
    doc.font("Helvetica");
    let totalAmount = 0;
    invoice.Order.OrderItems.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.Menu.name} - Qty: ${item.quantity} - Price: $${item.Menu.price}`);
      totalAmount += item.quantity * item.Menu.price;
    });
    doc.moveDown();

    doc.font("Helvetica-Bold").text(`Total Amount: $${totalAmount.toFixed(2)}`, { align: "right" });
    doc.moveDown();
    doc.font("Helvetica").text(`Payment Status: ${invoice.paymentStatus}`);
    if (invoice.paymentMethod) doc.text(`Payment Method: ${invoice.paymentMethod}`);
    doc.end();

    stream.on("finish", () => {
      res.setHeader("Content-Disposition", `attachment; filename=invoice-${invoice.id}.pdf`);
      res.setHeader("Content-Type", "application/pdf");
      res.download(filePath);
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};

const getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await invoiceSchema.findOne({
      where: { id: invoiceId },
      include: [
        {
          model: orderSchema,
          include: [
            {
              model: orderItemSchema,
              include: [{ model: menuItemSchema }],
            },
            { model: tableSchema },
          ],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Failed to fetch invoice" });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;

    const invoice = await Invoice.findOne({ where: { id: invoiceId } });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    console.log(status)
    if (!["Paid", "Pending", "Failed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    invoice.paymentStatus = status;
    await invoice.save();

    if (status === "Paid" || status === "Cancelled") {
      const order = await Order.findOne({ where: { id: invoice.orderId } });

      if (order) {
        const table = await Table.findByPk(order.tableId);
        if (table) {
          await table.update({ is_occupied: false, reservationStatus: "available" });
        }
      }
    }

    res.status(200).json({ message: "Invoice status updated successfully", invoice });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).json({ message: "Failed to update invoice status" });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    const { status, customerName, dateRange } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (customerName) {
      where["$Order.customer_name$"] = { [Op.like]: `%${customerName}%` };
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(",");
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const invoices = await invoiceSchema.findAll({
      where,
      include: [
        {
          model: orderSchema,
          include: [
            {
              model: orderItemSchema,
              include: [{ model: menuItemSchema }],
            },
            { model: tableSchema },
          ],
        },
      ],
    });

    if (invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found" });
    }

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

module.exports = {
  generateInvoice,
  getInvoice,
  updateInvoiceStatus,
  getAllInvoices,
};
