const { sequelize } = require('./config/database');
const { Student } = require('./src/models');

async function updateStudentClassNames() {
  try {
    console.log('更新学生班级数据...');
    
    // 更新所有学生的className字段
    await Student.update(
      { className: '高一(1)班' },
      { where: { name: ['张三', '李四'] } }
    );
    
    await Student.update(
      { className: '高一(2)班' },
      { where: { name: ['王五', '赵六'] } }
    );
    
    console.log('学生班级数据更新成功');
    
    // 验证更新结果
    const students = await Student.findAll();
    console.log('更新后的学生数据:');
    students.forEach(student => {
      console.log(`${student.name} - ${student.className} - ${student.studentId}`);
    });
    
  } catch (error) {
    console.error('更新学生班级数据失败:', error);
  } finally {
    await sequelize.close();
  }
}

updateStudentClassNames();