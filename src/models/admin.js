const {DataTypes } = require('sequelize'); 
const sequelize=require("../config/db")

const superAdminSchema = sequelize.define('SuperAdmin', {
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
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'superAdmin',
  },
  phoneNumber:{
    type:DataTypes.STRING,
    allowNull:true,
  },
},{
  timestamps:true,
});

module.exports = superAdminSchema;
