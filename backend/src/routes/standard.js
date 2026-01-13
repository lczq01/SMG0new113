const express = require('express');
const { Standard } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取所有标准
router.get('/', auth, async (req, res) => {
  try {
    const standards = await Standard.findAll();
    
    res.json({
      success: true,
      message: '获取成功',
      data: standards
    });
  } catch (error) {
    console.error('获取标准列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 根据学生ID获取标准
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const standards = await Standard.findAll({
      where: { studentId }
    });
    
    res.json({
      success: true,
      message: '获取成功',
      data: standards
    });
  } catch (error) {
    console.error('获取学生标准错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 获取单个标准
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const standard = await Standard.findByPk(id);
    
    if (!standard) {
      return res.status(404).json({
        success: false,
        message: '标准不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: '获取成功',
      data: standard
    });
  } catch (error) {
    console.error('获取标准错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 创建标准
router.post('/', auth, async (req, res) => {
  try {
    const { studentId, name, value } = req.body;
    
    if (!studentId || !name || value === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供学生ID、标准名称和标准值',
        data: null
      });
    }
    
    const standard = await Standard.create({
      studentId,
      name,
      value
    });
    
    res.json({
      success: true,
      message: '添加成功',
      data: standard
    });
  } catch (error) {
    console.error('创建标准错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 更新标准
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, value } = req.body;
    
    const standard = await Standard.findByPk(id);
    
    if (!standard) {
      return res.status(404).json({
        success: false,
        message: '标准不存在',
        data: null
      });
    }
    
    await standard.update({
      name: name || standard.name,
      value: value !== undefined ? value : standard.value
    });
    
    res.json({
      success: true,
      message: '更新成功',
      data: standard
    });
  } catch (error) {
    console.error('更新标准错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 删除标准
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const standard = await Standard.findByPk(id);
    
    if (!standard) {
      return res.status(404).json({
        success: false,
        message: '标准不存在',
        data: null
      });
    }
    
    await standard.destroy();
    
    res.json({
      success: true,
      message: '删除成功',
      data: true
    });
  } catch (error) {
    console.error('删除标准错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

module.exports = router;