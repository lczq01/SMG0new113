const fetch = require('node-fetch');

// 测试教师登录
async function testTeacherLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/teacher/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'teacher',
        password: 'teacher123'
      }),
    });

    const data = await response.json();
    console.log('教师登录测试结果:', data);
    
    if (data.success) {
      console.log('✅ 教师登录成功');
    } else {
      console.log('❌ 教师登录失败:', data.message);
    }
  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testTeacherLogin();
