const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  class: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '班级名称'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '学生姓名'
  },
  studentId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '学号'
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
  tableName: 'students',
  timestamps: true
});

module.exports = Student;