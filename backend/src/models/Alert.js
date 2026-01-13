const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Alert = sequelize.define('Alert', {
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
    type: DataTypes.ENUM('continuous_declining', 'multiple_violations', 'declining_and_violation'),
    allowNull: false,
    comment: '预警类型'
  },
  typeText: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '预警类型文本'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '预警原因'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'alerts',
  timestamps: true,
  updatedAt: false
});

module.exports = Alert;