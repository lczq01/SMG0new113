const express = require('express');
const { Teacher } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('接收到的教师登录参数:', { username });

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供用户名和密码',
        data: null
      });
    }

    const teacher = await Teacher.findOne({
      where: {
        username
      }
    });
    
    console.log('查询到的教师:', teacher);

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: '教师账号不存在',
        data: null
      });
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '密码错误',
        data: null
      });
    }

    const token = jwt.sign(
      {
        id: teacher.id,
        username: teacher.username,
        role: 'teacher'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        id: teacher.id,
        username: teacher.username
      },
      token
    });
  } catch (error) {
    console.error('教师登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

module.exports = router;