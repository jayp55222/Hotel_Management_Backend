const hotelTableSchema = require('../models/hotelTable');
const { successResponse, errorResponse } = require('../utils/responseFormat');

const createHotelTable = async (req, res) => {
  try {
    const { tableNumber, seats, superAdminId } = req.body;

    if (!tableNumber || !seats || !superAdminId) {
      return errorResponse(res, null, 'Missing required fields: tableNumber, seats, or superAdminId', 400);
    }

    const newHotelTable = await hotelTableSchema.create({ tableNumber, seats, superAdminId });

    return successResponse(res, newHotelTable, 'Table data added successfully!', 201);

  } catch (error) {
    console.error(error.message);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return errorResponse(res, error.message, 'Table number must be unique.', 409);
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return errorResponse(res, error.message, 'SuperAdmin ID not found in the database.', 404);
    }

    return errorResponse(res, error.message, 'Error adding table details.');
  }
};

const getAllHotelTables = async (req, res) => {
  try {
    const { reservationStatus, seats, is_occupied, superAdminId } = req.query;

    const filterOptions = {};
    if (reservationStatus) filterOptions.reservationStatus = reservationStatus;
    if (seats) filterOptions.seats = seats;
    if (is_occupied !== undefined) filterOptions.is_occupied = is_occupied === 'true';
    if (superAdminId) filterOptions.superAdminId = superAdminId;

    const hotelTables = await hotelTableSchema.findAll({ where: filterOptions });

    return successResponse(res, hotelTables, 'Hotel tables retrieved successfully!');
  } catch (error) {
    console.error(error.message);
    return errorResponse(res, error.message, 'Error retrieving table details.');
  }
};

const getHotelTableById = async (req, res) => {
  const { id } = req.params;
  try {
    const hotelTable = await hotelTableSchema.findByPk(id);

    if (!hotelTable) {
      return errorResponse(res, null, 'Table details not found.', 404);
    }

    return successResponse(res, hotelTable, 'Table details retrieved successfully!');
  } catch (error) {
    console.error(error.message);
    return errorResponse(res, error.message, 'Error retrieving table details.');
  }
};


const updateHotelTable = async (req, res) => {
  const { id } = req.params;
  const { tableNumber, seats, superAdminId, reservationStatus, is_occupied } = req.body;

  try {
    const hotelTable = await hotelTableSchema.findByPk(id);

    if (!hotelTable) {
      return errorResponse(res, null, 'Table details not found.', 404);
    }

    if (tableNumber && tableNumber !== hotelTable.tableNumber) {
      const existingTable = await hotelTableSchema.findOne({ where: { tableNumber } });
      if (existingTable) {
        return errorResponse(res, null, `Table number ${tableNumber} is already in use.`, 409);
      }
    }

    if (superAdminId) {
      const superAdmin = await SuperAdmin.findByPk(superAdminId);
      if (!superAdmin) {
        return errorResponse(res, null, `SuperAdmin with ID ${superAdminId} not found.`, 404);
      }
    }

    hotelTable.tableNumber = tableNumber || hotelTable.tableNumber;
    hotelTable.seats = seats || hotelTable.seats;
    hotelTable.superAdminId = superAdminId || hotelTable.superAdminId;
    hotelTable.reservationStatus = reservationStatus || hotelTable.reservationStatus;
    hotelTable.is_occupied = is_occupied !== undefined ? is_occupied : hotelTable.is_occupied;

    await hotelTable.save();

    return successResponse(res, hotelTable, 'Table details updated successfully!');
  } catch (error) {
    console.error(error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return errorResponse(res, error.message, 'Table number must be unique.', 409);
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return errorResponse(res, error.message, 'SuperAdmin ID not found in the database.', 404);
    }

    return errorResponse(res, error.message, 'Error updating table details.', 500);
  }
};
const deleteHotelTable = async (req, res) => {
  const { id } = req.params;
  try {
    const hotelTable = await hotelTableSchema.findByPk(id);

    if (!hotelTable) {
      return errorResponse(res, null, 'Table details not found.', 404);
    }

    await hotelTable.destroy();

    return successResponse(res, null, 'Table details deleted successfully!');
  } catch (error) {
    console.error(error.message);
    return errorResponse(res, error.message, 'Error deleting table details.');
  }
};

module.exports = { createHotelTable, getAllHotelTables, getHotelTableById, updateHotelTable, deleteHotelTable };
