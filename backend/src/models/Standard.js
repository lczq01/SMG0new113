const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Standard = sequelize.define('Standard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '学生ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '标准名称'
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '标准值'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'standards',
  timestamps: true
});

module.exports = Standard;