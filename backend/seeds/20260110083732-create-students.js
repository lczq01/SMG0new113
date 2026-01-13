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
    // 插入学生数据
    await queryInterface.bulkInsert('students', [
      {
        class: '高一(1)班',
        name: '张三',
        studentId: '2024001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        class: '高一(1)班',
        name: '李四',
        studentId: '2024002',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        class: '高一(2)班',
        name: '王五',
        studentId: '2024003',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        class: '高一(2)班',
        name: '赵六',
        studentId: '2024004',
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
    // 删除学生数据
    await queryInterface.bulkDelete('students', null, {});
  }
};
