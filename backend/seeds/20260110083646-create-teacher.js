'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    // 生成密码哈希
    const passwordHash = await bcrypt.hash('teacher123', 10);
    
    // 插入教师数据
    await queryInterface.bulkInsert('teachers', [{
      username: 'teacher',
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    // 删除教师数据
    await queryInterface.bulkDelete('teachers', null, {});
  }
};
