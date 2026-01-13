const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// 加载环境变量
dotenv.config();

// 创建Sequelize实例
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 30000,
      charset: 'utf8mb4'
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

// 测试数据库连接并创建数据库
const testConnection = async () => {
  try {
    // 尝试连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    // 如果数据库不存在，尝试创建
    if (error.name === 'SequelizeConnectionError' && error.original.code === 'ER_BAD_DB_ERROR') {
      console.log('数据库不存在，尝试创建...');
      try {
        // 创建数据库连接（不指定数据库名）
        const adminSequelize = new Sequelize({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          dialect: 'mysql',
          logging: false
        });
        // 创建数据库
        await adminSequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('数据库创建成功');
        // 关闭管理员连接
        await adminSequelize.close();
        // 重新连接到新创建的数据库
        await sequelize.authenticate();
        console.log('数据库连接成功');
      } catch (createError) {
        console.error('创建数据库失败:', createError);
      }
    }
  }
};

// 导出Sequelize实例和测试连接函数
module.exports = {
  sequelize,
  testConnection,
  // 为Sequelize CLI添加配置
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialectOptions: {
    charset: 'utf8mb4'
  }
};