const { sequelize } = require('./config/database');

async function updateDatabaseCharset() {
  try {
    console.log('修改数据库字符编码...');
    
    // 修改数据库字符编码
    await sequelize.query('ALTER DATABASE student_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('数据库字符编码修改成功');
    
    // 修改students表字符编码
    await sequelize.query('ALTER TABLE students CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('students表字符编码修改成功');
    
    // 修改其他表字符编码
    const tables = ['exam_rankings', 'standards', 'violations', 'alerts', 'teachers'];
    for (const table of tables) {
      await sequelize.query(`ALTER TABLE ${table} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`${table}表字符编码修改成功`);
    }
    
    console.log('所有表字符编码修改完成');
    
  } catch (error) {
    console.error('修改数据库字符编码失败:', error);
  } finally {
    await sequelize.close();
  }
}

updateDatabaseCharset();