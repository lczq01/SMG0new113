const express = require('express');
const { Student, ExamRanking, Standard, Violation } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取所有班级列表
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.findAll();
    
    // 提取所有不重复的班级名称
    const classNames = [...new Set(students.map(student => student.class))];
    
    // 计算每个班级的学生数量
    const classList = classNames.map(className => {
      const studentCount = students.filter(student => student.class === className).length;
      return {
        name: className,
        studentCount
      };
    });
    
    res.json({
      success: true,
      message: '获取班级列表成功',
      data: classList
    });
  } catch (error) {
    console.error('获取班级列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 获取单个班级详情
router.get('/:className', auth, async (req, res) => {
  try {
    const { className } = req.params;
    
    const students = await Student.findAll({
      where: { class: className }
    });
    
    const classInfo = {
      name: className,
      studentCount: students.length,
      students: students.map(student => ({
        id: student.id,
        name: student.name,
        studentId: student.studentId
      }))
    };
    
    res.json({
      success: true,
      message: '获取班级详情成功',
      data: classInfo
    });
  } catch (error) {
    console.error('获取班级详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 添加新班级（通过添加第一个学生来创建班级）
router.post('/', auth, async (req, res) => {
  try {
    const { className, name, studentId } = req.body;
    
    if (!className || !name || !studentId) {
      return res.status(400).json({
        success: false,
        message: '请提供班级名称、学生姓名和学号',
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
      class: className,
      name,
      studentId
    });
    
    res.json({
      success: true,
      message: '创建班级和学生成功',
      data: {
        className,
        studentCount: 1,
        firstStudent: student
      }
    });
  } catch (error) {
    console.error('创建班级错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 编辑班级名称
router.put('/:oldClassName', auth, async (req, res) => {
  try {
    const { oldClassName } = req.params;
    const { newClassName } = req.body;
    
    if (!newClassName) {
      return res.status(400).json({
        success: false,
        message: '请提供新的班级名称',
        data: null
      });
    }
    
    // 批量更新学生的班级名称
    const [updatedCount] = await Student.update(
      { class: newClassName },
      { where: { class: oldClassName } }
    );
    
    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        message: '班级不存在',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: '更新班级名称成功',
      data: {
        oldClassName,
        newClassName,
        updatedCount
      }
    });
  } catch (error) {
    console.error('更新班级名称错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 删除班级
router.delete('/:className', auth, async (req, res) => {
  try {
    const { className } = req.params;
    
    // 查找该班级的所有学生
    const students = await Student.findAll({
      where: { class: className }
    });
    
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: '班级不存在',
        data: null
      });
    }
    
    // 获取学生ID列表
    const studentIds = students.map(student => student.id);
    
    // 开始事务
    const transaction = await Student.sequelize.transaction();
    
    try {
      // 删除关联的违规记录
      await Violation.destroy({
        where: { studentId: studentIds },
        transaction
      });
      
      // 删除关联的标准设置
      await Standard.destroy({
        where: { studentId: studentIds },
        transaction
      });
      
      // 删除关联的考试排名
      await ExamRanking.destroy({
        where: { studentId: studentIds },
        transaction
      });
      
      // 删除学生
      await Student.destroy({
        where: { class: className },
        transaction
      });
      
      // 提交事务
      await transaction.commit();
      
      res.json({
        success: true,
        message: '删除班级成功',
        data: {
          className,
          deletedStudentCount: students.length
        }
      });
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('删除班级错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      data: null
    });
  }
});

module.exports = router;