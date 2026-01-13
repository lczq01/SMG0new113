const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ExamRanking = sequelize.define('ExamRanking', {
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
  examName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '考试名称'
  },
  ranking: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '排名'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'exam_rankings',
  timestamps: true,
  updatedAt: false
});

module.exports = ExamRanking;