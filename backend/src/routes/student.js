const express = require('express');
const { Student, ExamRanking, Standard, Violation, Alert, sequelize, Op } = require('../models');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');


const router = express.Router();

// 获取所有学生信息
router.get('/', auth, async (req, res) => {
  try {
    // 解构查询参数并设置默认值
    const { page = 1, pageSize = 10, className, search } = req.query;
    
    // 限制pageSize的最大值，防止查询过大数据
    const maxPageSize = 10000;
    const parsedPageSize = Math.min(parseInt(pageSize), maxPageSize);
    const parsedPage = parseInt(page);
    
    const where = {};
    
    // 按班级筛选
    if (className) {
      where.class = className;
    }
    
    // 按姓名或学号搜索
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { studentId: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // 计算偏移量
    const offset = (parsedPage - 1) * parsedPageSize;
    
    // 查询学生信息
    const { count, rows: students } = await Student.findAndCountAll({
      where,
      limit: parsedPageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    // 计算总页数
    const totalPages = Math.ceil(count / parsedPageSize);
    
    res.json({
      success: true,
      message: '获取成功',
      data: {
        students,
        pagination: {
          total: count,
          page: parsedPage,
          pageSize: parsedPageSize,
          totalPages: totalPages
        }
      }
    });
  } catch (error) {
    console.error('获取学生列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { class: studentClass, name, studentId } = req.body;
    
    console.log('接收到的登录参数:', { studentClass, name, studentId });

    if (!studentClass || !name || !studentId) {
      return res.status(400).json({
        success: false,
        message: '请提供班级、姓名和学号',
        data: null
      });
    }

    const student = await Student.findOne({
        where: {
          class: studentClass,
          name,
          studentId
        }
      });
    
    console.log('查询到的学生:', student);

    if (!student) {
      return res.status(401).json({
        success: false,
        message: '学生信息不存在',
        data: null
      });
    }

    const token = jwt.sign(
      {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        role: 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: student,
      token
    });
  } catch (error) {
    console.error('学生登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学生信息不存在',
        data: null
      });
    }

    res.json({
      success: true,
      message: '获取成功',
      data: student
    });
  } catch (error) {
    console.error('获取学生信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 创建单个学生
router.post('/', auth, async (req, res) => {
  try {
    const { class: studentClass, name, studentId } = req.body;
    
    if (!studentClass || !name || !studentId) {
      return res.status(400).json({
        success: false,
        message: '请提供班级、姓名和学号',
        data: null
      });
    }
    
    // 检查学号是否已存在
    const existingStudent = await Student.findOne({
      where: { studentId }
    });
    
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: '学号已存在',
        data: null
      });
    }
    
    const student = await Student.create({
      class: studentClass,
      name,
      studentId
    });
    
    res.json({
      success: true,
      message: '创建学生成功',
      data: student
    });
  } catch (error) {
    console.error('创建学生错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 批量创建学生
router.post('/batch', auth, async (req, res) => {
  try {
    const students = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的学生数据列表',
        data: null
      });
    }
    
    // 批量创建学生，设置更大的批量大小
    const createdStudents = await Student.bulkCreate(students, { 
      ignoreDuplicates: true, // 忽略重复的学号
      batchSize: 1000 // 增加批量插入大小限制
    });
    
    // 获取数据库中实际的学生数量，用于验证导入结果
    const totalStudents = await Student.count();
    
    res.json({
      success: true,
      message: `批量创建完成，成功 ${createdStudents.length} 条，数据库中总共有 ${totalStudents} 条学生记录`,
      data: { 
        success: createdStudents,
        totalStudents: totalStudents
      }
    });
  } catch (error) {
    console.error('批量创建学生错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 更新学生信息
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { class: studentClass, name, studentId } = req.body;
    
    if (!studentClass || !name || !studentId) {
      return res.status(400).json({
        success: false,
        message: '请提供班级、姓名和学号',
        data: null
      });
    }
    
    // 检查学生是否存在
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学生不存在',
        data: null
      });
    }
    
    // 检查学号是否已被其他学生使用
    const existingStudent = await Student.findOne({
      where: { studentId, id: { [Op.not]: id } }
    });
    
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: '学号已被其他学生使用',
        data: null
      });
    }
    
    // 更新学生信息
    await student.update({
      class: studentClass,
      name,
      studentId
    });
    
    res.json({
      success: true,
      message: '更新学生成功',
      data: student
    });
  } catch (error) {
    console.error('更新学生错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 删除学生（含关联数据）
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查学生是否存在
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学生不存在',
        data: null
      });
    }
    
    // 开始事务
    await sequelize.transaction(async (transaction) => {
      // 删除关联的预警信息
      await Alert.destroy({
        where: { studentId: id },
        transaction
      });
      
      // 删除关联的违规记录
      await Violation.destroy({
        where: { studentId: id },
        transaction
      });
      
      // 删除关联的标准设置
      await Standard.destroy({
        where: { studentId: id },
        transaction
      });
      
      // 删除关联的考试排名
      await ExamRanking.destroy({
        where: { studentId: id },
        transaction
      });
      
      // 删除学生
      await student.destroy({ transaction });
    });
    
    res.json({
      success: true,
      message: '删除学生及其关联数据成功',
      data: true
    });
  } catch (error) {
    console.error('删除学生错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

module.exports = router;