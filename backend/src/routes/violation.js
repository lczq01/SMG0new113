const express = require('express');
const { Violation } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取所有违规记录
router.get('/', auth, async (req, res) => {
  try {
    const violations = await Violation.findAll();
    
    res.json({
      success: true,
      message: '获取成功',
      data: violations
    });
  } catch (error) {
    console.error('获取违规记录列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 根据学生ID获取违规记录
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const violations = await Violation.findAll({
      where: { studentId }
    });
    
    res.json({
      success: true,
      message: '获取成功',
      data: violations
    });
  } catch (error) {
    console.error('获取学生违规记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 获取单个违规记录
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const violation = await Violation.findByPk(id);
    
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: '违规记录不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: '获取成功',
      data: violation
    });
  } catch (error) {
    console.error('获取违规记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 创建违规记录
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, type, violationDate } = req.body;
    
    if (!studentId || !type || !violationDate) {
      return res.status(400).json({
        success: false,
        message: '请提供学生ID、违规类型和违规时间',
        data: null
      });
    }
    
    const violation = await Violation.create({
      studentId,
      type,
      violationDate
    });
    
    res.json({
      success: true,
      message: '添加成功',
      data: violation
    });
  } catch (error) {
    console.error('创建违规记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 更新违规记录
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, violationDate } = req.body;
    
    const violation = await Violation.findByPk(id);
    
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: '违规记录不存在',
        data: null
      });
    }
    
    await violation.update({
      type: type || violation.type,
      violationDate: violationDate || violation.violationDate
    });
    
    res.json({
      success: true,
      message: '更新成功',
      data: violation
    });
  } catch (error) {
    console.error('更新违规记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 删除违规记录
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const violation = await Violation.findByPk(id);
    
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: '违规记录不存在',
        data: null
      });
    }
    
    await violation.destroy();
    
    res.json({
      success: true,
      message: '删除成功',
      data: true
    });
  } catch (error) {
    console.error('删除违规记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

module.exports = router;