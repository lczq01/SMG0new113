const express = require('express');
const { Alert, Student } = require('../models');
const { sequelize } = require('../../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取所有预警信息
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      include: [
        {
          model: Student,
          as: 'student'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: '获取预警信息成功',
      data: alerts
    });
  } catch (error) {
    console.error('获取预警信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 根据学生ID获取预警信息
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    const alerts = await Alert.findAll({
      where: { studentId },
      include: [
        {
          model: Student,
          as: 'student'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: '获取学生预警信息成功',
      data: alerts
    });
  } catch (error) {
    console.error('获取学生预警信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 根据预警类型获取预警信息
router.get('/type/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;

    const alerts = await Alert.findAll({
      where: { type },
      include: [
        {
          model: Student,
          as: 'student'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: '获取预警信息成功',
      data: alerts
    });
  } catch (error) {
    console.error('获取预警信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 获取预警统计信息
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Alert.findAll({
      attributes: [
        'type',
        'typeText',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type', 'typeText']
    });

    res.json({
      success: true,
      message: '获取预警统计信息成功',
      data: stats
    });
  } catch (error) {
    console.error('获取预警统计信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

module.exports = router;