const { Teacher } = require('./src/models');
const bcrypt = require('bcrypt');

// 测试数据库连接和教师数据
async function testDatabase() {
  try {
    // 查询所有教师数据
    const teachers = await Teacher.findAll();
    console.log('数据库中的教师数据:', teachers);
    
    // 测试密码验证
    if (teachers.length > 0) {
      const teacher = teachers[0];
      const isPasswordValid = await bcrypt.compare('teacher123', teacher.password);
      console.log('密码验证结果:', isPasswordValid);
      
      if (isPasswordValid) {
        console.log('✅ 密码验证成功');
      } else {
        console.log('❌ 密码验证失败');
      }
    } else {
      console.log('❌ 数据库中没有教师数据');
    }
  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message);
  } finally {
    // 关闭数据库连接
    process.exit();
  }
}

// 运行测试
testDatabase();
