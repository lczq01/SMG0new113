const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const rankingRoutes = require('./routes/ranking');
const standardRoutes = require('./routes/standard');
const violationRoutes = require('./routes/violation');
const classRoutes = require('./routes/class');
const exportRoutes = require('./routes/export');
const alertRoutes = require('./routes/alert');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

const PORT = process.env.PORT || 3000;

// Swagger 配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '学生管理系统 API',
      version: '1.0.0',
      description: '学生管理系统后端API文档',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: '本地服务器',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json({
    success: true,
    message: '学生管理系统后端API',
    version: '1.0.0',
    docs: `http://localhost:${PORT}/api-docs`
  });
});

app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/standard', standardRoutes);
app.use('/api/violation', violationRoutes);
app.use('/api/class', classRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/alert', alertRoutes);

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`API文档地址: http://localhost:${PORT}/api-docs`);
});

module.exports = app;