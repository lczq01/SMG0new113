// 导入数据库连接
const { sequelize } = require('../../config/database');

// 导入模型
const Student = require('./Student');
const ExamRanking = require('./ExamRanking');
const Standard = require('./Standard');
const Violation = require('./Violation');
const Alert = require('./Alert');
const Teacher = require('./Teacher');

// 定义模型之间的关联关系
// Student 与 ExamRanking 一对多
Student.hasMany(ExamRanking, { foreignKey: 'studentId', as: 'rankings' });
ExamRanking.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Student 与 Standard 一对多
Student.hasMany(Standard, { foreignKey: 'studentId', as: 'standards' });
Standard.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Student 与 Violation 一对多
Student.hasMany(Violation, { foreignKey: 'studentId', as: 'violations' });
Violation.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Student 与 Alert 一对多
Student.hasMany(Alert, { foreignKey: 'studentId', as: 'alerts' });
Alert.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// 导出所有模型
module.exports = {
  Student,
  ExamRanking,
  Standard,
  Violation,
  Alert,
  Teacher,
  sequelize
};