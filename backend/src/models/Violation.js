const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Violation = sequelize.define('Violation', {
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
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '违规类型'
  },
  violationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '违规时间'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'violations',
  timestamps: true,
  updatedAt: false
});

module.exports = Violation;