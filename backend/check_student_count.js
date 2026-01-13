// 查询数据库中当前学生总数的脚本
const { Student, sequelize } = require('./src/models');

(async () => {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 查询学生总数
    const count = await Student.count();
    console.log('数据库中当前学生总数:', count);
    
    // 查询学生总数（带分页信息）
    const { count: totalCount, rows: students } = await Student.findAndCountAll();
    console.log('带分页查询的学生总数:', totalCount);
    console.log('当前查询到的学生数量:', students.length);
    
    // 关闭数据库连接
    await sequelize.close();
  } catch (error) {
    console.error('查询学生总数失败:', error);
    process.exit(1);
  }
})();
