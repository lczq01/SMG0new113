const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌',
      data: null
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '认证令牌无效',
      data: null
    });
  }
};

const teacherAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: '权限不足，需要教师角色',
        data: null
      });
    }
    next();
  });
};

module.exports = {
  auth,
  teacherAuth
};