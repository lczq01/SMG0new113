'use strict';

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
    // 插入违规记录数据
    await queryInterface.bulkInsert('violations', [
      // 张三的违规记录
      {
        studentId: 1,
        type: '迟到',
        violationDate: new Date('2024-01-15'),
        createdAt: new Date()
      },
      {
        studentId: 1,
        type: '未完成作业',
        violationDate: new Date('2024-01-20'),
        createdAt: new Date()
      },
      {
        studentId: 1,
        type: '课堂违纪',
        violationDate: new Date('2024-01-25'),
        createdAt: new Date()
      },
      // 王五的违规记录
      {
        studentId: 3,
        type: '迟到',
        violationDate: new Date('2024-01-10'),
        createdAt: new Date()
      },
      {
        studentId: 3,
        type: '未完成作业',
        violationDate: new Date('2024-01-18'),
        createdAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    // 删除违规记录数据
    await queryInterface.bulkDelete('violations', null, {});
  }
};
