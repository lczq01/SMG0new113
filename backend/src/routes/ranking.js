const express = require('express');
const { ExamRanking, Student, sequelize } = require('../models');
const { teacherAuth, auth } = require('../middleware/auth');

const router = express.Router();

// 获取所有排名记录（基础路由，兼容前端调用）
router.get('/', auth, async (req, res) => {
  try {
    const { examName, className } = req.query;
    
    console.log('获取所有排名记录:', { examName, className });

    let whereCondition = {};
    let includeCondition = [];

    if (examName) {
      whereCondition.examName = examName;
    }

    if (className) {
      includeCondition.push({
        model: Student,
        as: 'student',
        where: { class: className },
        attributes: ['id', 'class', 'name', 'studentId']
      });
    } else {
      includeCondition.push({
        model: Student,
        as: 'student',
        attributes: ['id', 'class', 'name', 'studentId']
      });
    }

    const rankings = await ExamRanking.findAll({
      where: whereCondition,
      include: includeCondition,
      order: [['examName', 'ASC'], ['ranking', 'ASC']]
    });

    res.json({
      success: true,
      message: '获取成功',
      data: rankings
    });
  } catch (error) {
    console.error('获取所有排名记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 学生获取个人排名记录
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log('获取学生排名记录:', { studentId });

    const rankings = await ExamRanking.findAll({
      where: {
        studentId
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: '获取成功',
      data: rankings
    });
  } catch (error) {
    console.error('获取学生排名记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 教师获取所有排名记录（支持筛选）
router.get('/all', teacherAuth, async (req, res) => {
  try {
    const { examName, className } = req.query;
    
    console.log('获取所有排名记录:', { examName, className });

    let whereCondition = {};
    let includeCondition = [];

    if (examName) {
      whereCondition.examName = examName;
    }

    if (className) {
      includeCondition.push({
        model: Student,
        as: 'student',
        where: { class: className },
        attributes: ['id', 'class', 'name', 'studentId']
      });
    } else {
      includeCondition.push({
        model: Student,
        as: 'student',
        attributes: ['id', 'class', 'name', 'studentId']
      });
    }

    const rankings = await ExamRanking.findAll({
      where: whereCondition,
      include: includeCondition,
      order: [['examName', 'ASC'], ['ranking', 'ASC']]
    });

    res.json({
      success: true,
      message: '获取成功',
      data: rankings
    });
  } catch (error) {
    console.error('获取所有排名记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 获取考试列表（用于前端动态生成考试列）
router.get('/exams', async (req, res) => {
  try {
    // 获取所有考试排名记录
    const allRankings = await ExamRanking.findAll({
      order: [['createdAt', 'DESC']]
    });

    // 提取唯一的考试名称并保持顺序
    const examSet = new Set();
    const examList = [];

    allRankings.forEach(ranking => {
      if (!examSet.has(ranking.examName)) {
        examSet.add(ranking.examName);
        examList.push(ranking.examName);
      }
    });

    res.json({
      success: true,
      message: '获取成功',
      data: examList
    });
  } catch (error) {
    console.error('获取考试列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 教师批量删除排名记录
router.delete('/batch', teacherAuth, async (req, res) => {
  try {
    const { examName } = req.body;
    
    console.log('批量删除排名记录:', { examName });

    if (!examName) {
      return res.status(400).json({
        success: false,
        message: '请提供考试名称',
        data: null
      });
    }

    const result = await ExamRanking.destroy({
      where: {
        examName
      }
    });

    res.json({
      success: true,
      message: '删除成功',
      data: { deletedCount: result }
    });
  } catch (error) {
    console.error('批量删除排名记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 教师创建排名记录
router.post('/', teacherAuth, async (req, res) => {
  try {
    const { studentId, examName, ranking } = req.body;
    
    console.log('创建排名记录:', { studentId, examName, ranking });

    if (!studentId || !examName || ranking === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供学生ID、考试名称和排名',
        data: null
      });
    }

    const rankingRecord = await ExamRanking.create({
      studentId,
      examName,
      ranking
    });

    res.json({
      success: true,
      message: '添加成功',
      data: rankingRecord
    });
  } catch (error) {
    console.error('创建排名记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 教师批量导入排名记录
router.post('/batch', teacherAuth, async (req, res) => {
  try {
    const rankings = req.body;
    
    console.log('批量导入排名记录:', { count: rankings.length });
    
    if (!Array.isArray(rankings) || rankings.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的排名数据列表',
        data: null
      });
    }
    
    // 批量创建排名记录
    const createdRankings = await ExamRanking.bulkCreate(rankings, {
      ignoreDuplicates: true, // 忽略重复的记录
      batchSize: 1000 // 批量大小
    });
    
    res.json({
      success: true,
      message: `批量导入完成，成功 ${createdRankings.length} 条记录`,
      data: {
        success: createdRankings,
        totalImported: createdRankings.length
      }
    });
  } catch (error) {
    console.error('批量导入排名记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 教师更新排名记录
router.put('/:id', teacherAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, examName, ranking } = req.body;
    
    console.log('更新排名记录:', { id, studentId, examName, ranking });

    const rankingRecord = await ExamRanking.findByPk(id);
    
    if (!rankingRecord) {
      return res.status(404).json({
        success: false,
        message: '排名记录不存在',
        data: null
      });
    }

    await rankingRecord.update({
      studentId: studentId || rankingRecord.studentId,
      examName: examName || rankingRecord.examName,
      ranking: ranking !== undefined ? ranking : rankingRecord.ranking
    });

    res.json({
      success: true,
      message: '更新成功',
      data: rankingRecord
    });
  } catch (error) {
    console.error('更新排名记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 教师删除排名记录
router.delete('/:id', teacherAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('删除排名记录:', { id });

    const result = await ExamRanking.destroy({
      where: {
        id
      }
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: '排名记录不存在',
        data: null
      });
    }

    res.json({
      success: true,
      message: '删除成功',
      data: true
    });
  } catch (error) {
    console.error('删除排名记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

module.exports = router;