const express = require('express');
const { Student, ExamRanking, Standard, Violation } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 导出所有数据（根路由，默认导出）
router.get('/', auth, async (req, res) => {
  try {
    const [students, rankings, standards, violations] = await Promise.all([
      Student.findAll(),
      ExamRanking.findAll(),
      Standard.findAll(),
      Violation.findAll()
    ]);

    res.json({
      success: true,
      message: '导出成功',
      data: {
        students,
        rankings,
        standards,
        violations
      }
    });
  } catch (error) {
    console.error('导出所有数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 导出学生数据
router.get('/students', auth, async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        {
          model: Standard,
          as: 'standards'
        },
        {
          model: ExamRanking,
          as: 'rankings'
        },
        {
          model: Violation,
          as: 'violations'
        }
      ]
    });

    res.json({
      success: true,
      message: '导出成功',
      data: students
    });
  } catch (error) {
    console.error('导出学生数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 导出考试排名数据
router.get('/rankings', auth, async (req, res) => {
  try {
    const rankings = await ExamRanking.findAll({
      include: [
        {
          model: Student,
          as: 'student'
        }
      ]
    });

    res.json({
      success: true,
      message: '导出成功',
      data: rankings
    });
  } catch (error) {
    console.error('导出排名数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 导出标准设置数据
router.get('/standards', auth, async (req, res) => {
  try {
    const standards = await Standard.findAll({
      include: [
        {
          model: Student,
          as: 'student'
        }
      ]
    });

    res.json({
      success: true,
      message: '导出成功',
      data: standards
    });
  } catch (error) {
    console.error('导出标准数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 导出违规记录数据
router.get('/violations', auth, async (req, res) => {
  try {
    const violations = await Violation.findAll({
      include: [
        {
          model: Student,
          as: 'student'
        }
      ]
    });

    res.json({
      success: true,
      message: '导出成功',
      data: violations
    });
  } catch (error) {
    console.error('导出违规数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 导出所有数据
router.get('/all', auth, async (req, res) => {
  try {
    const [students, rankings, standards, violations] = await Promise.all([
      Student.findAll(),
      ExamRanking.findAll(),
      Standard.findAll(),
      Violation.findAll()
    ]);

    res.json({
      success: true,
      message: '导出成功',
      data: {
        students,
        rankings,
        standards,
        violations
      }
    });
  } catch (error) {
    console.error('导出所有数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

module.exports = router;