const { DataTypes } = require('sequelize'); 
const sequelize = require('../config/db'); 
const waiterSchema= sequelize.define('Waiter', {
    id: {
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phoneNumber:{
      type:DataTypes.STRING,
      allowNull:true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'waiter',
    },
    superAdminId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
          model: 'superadmins',
          key: 'id',
    },
    },
    
},{
  timestamps:true
});
module.exports=waiterSchema



