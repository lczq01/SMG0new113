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
    // 插入标准数据
    await queryInterface.bulkInsert('standards', [
      // 张三的标准
      {
        studentId: 1,
        name: '作业标准',
        value: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: 1,
        name: '课堂表现',
        value: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: 1,
        name: '考勤情况',
        value: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 李四的标准
      {
        studentId: 2,
        name: '作业标准',
        value: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: 2,
        name: '课堂表现',
        value: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: 2,
        name: '考勤情况',
        value: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 王五的标准
      {
        studentId: 3,
        name: '作业标准',
        value: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: 3,
        name: '课堂表现',
        value: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: 3,
        name: '考勤情况',
        value: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 赵六的标准
      {
        studentId: 4,
        name: '作业标准',
        value: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: 4,
        name: '课堂表现',
        value: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: 4,
        name: '考勤情况',
        value: 4,
        createdAt: new Date(),
        updatedAt: new Date()
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
    // 删除标准数据
    await queryInterface.bulkDelete('standards', null, {});
  }
};
