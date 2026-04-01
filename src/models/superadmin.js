const { DataTypes } = require('sequelize');
const sequelize = require("../config/db")

const superAdminSchema = sequelize.define(
    "SuperAdmin",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
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
            validate: {
                isEmail: true,
            },
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        role: {
            type: DataTypes.ENUM("superadmin"),
            defaultValue: "superadmin",
        },

        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },

        lastLogin: {
            type: DataTypes.DATE,
        },
    },
    {
        // tableName: "superadmins",
        timestamps: true,
    }
);

module.exports =
    superAdminSchema

