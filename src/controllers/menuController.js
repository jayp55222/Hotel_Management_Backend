const { Op } = require('sequelize');
const menuItemSchema = require('../models/menuItem');
const { successResponse, errorResponse } = require('../utils/responseFormat');

const createMenuItem = async (req, res) => {
  try {
    const menuItemData = req.body;
 
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    menuItemData.imageUrl = JSON.stringify(imagePaths);

    const existingItem = await menuItemSchema.findOne({
      where: {
        name: menuItemData.name,
        category: menuItemData.category
      }
    });

    if (existingItem) {
      return errorResponse(res, null, `Menu item with name '${menuItemData.name}' and category '${menuItemData.category}' already exists.`, 409);
    }
    console.log(menuItemData)

    const newMenuItem = await menuItemSchema.create(menuItemData);

    if (!newMenuItem.imageUrl || newMenuItem.imageUrl.length === 0) {
      return errorResponse(res, null, 'Menu item created, but images were not saved in the database.', 500);
    }

    return successResponse(res, { menuItemId: newMenuItem.id, imagePaths }, 'Menu item added successfully!', 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, error.message, 'Error adding menu item.', 500);
  }
};

const getAllMenuItems = async (req, res) => {
  try {
    const { category, isAvailable, minPrice, maxPrice, search } = req.query;
    const filterCondition = {};

    if (category) filterCondition.category = category;
    if (isAvailable !== undefined) filterCondition.isAvailable = isAvailable;
    if (minPrice || maxPrice) filterCondition.price = { [Op.between]: [parseFloat(minPrice) || 0, parseFloat(maxPrice) || Infinity] };
    if (search) filterCondition.name = { [Op.like]: `%${search}%` };

    const menuItems = await menuItemSchema.findAll({ where: filterCondition });

    if (menuItems.length === 0) {
      return errorResponse(res, null, 'No menu items found based on the provided filters.', 404);
    }

    return successResponse(res, menuItems, 'Menu items retrieved successfully!');
  } catch (error) {
    console.error(error);
    return errorResponse(res, error.message, 'Error retrieving menu items.', 500);
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, null, 'Menu item ID is required.', 400);
    }

    const menuItem = await menuItemSchema.findByPk(id);

    if (!menuItem) {
      return errorResponse(res, null, 'Menu item not found.', 404);
    }

    return successResponse(res, menuItem, 'Menu item retrieved successfully!');
  } catch (error) {
    console.error(error);
    return errorResponse(res, error.message, 'Error retrieving menu item.', 500);
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateMenuItemBody = req.body;

    if (!id) {
      return errorResponse(res, null, 'Menu item ID is required.', 400);
    }

    const menuItem = await menuItemSchema.findByPk(id);

    if (!menuItem) {
      return errorResponse(res, null, 'Menu item not found.', 404);
    }

    await menuItem.update(updateMenuItemBody);

    return successResponse(res, menuItem, 'Menu item updated successfully!');
  } catch (error) {
    console.error(error);
    return errorResponse(res, error.message, 'Error updating menu item.', 500);
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, null, 'Menu item ID is required.', 400);
    }

    const menuItem = await menuItemSchema.findByPk(id);

    if (!menuItem) {
      return errorResponse(res, null, 'Menu item not found.', 404);
    }

    await menuItem.destroy();

    return successResponse(res, null, 'Menu item deleted successfully!');
  } catch (error) {
    console.error(error);
    return errorResponse(res, error.message, 'Error deleting menu item.', 500);
  }
};

module.exports = { createMenuItem, getAllMenuItems, getMenuItemById, updateMenuItem, deleteMenuItem };
