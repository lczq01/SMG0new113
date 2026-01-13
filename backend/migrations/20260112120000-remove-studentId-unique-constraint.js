'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    // 移除studentId字段的唯一约束
    await queryInterface.removeConstraint('students', 'students_studentId_key');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     */
    // 恢复studentId字段的唯一约束
    await queryInterface.addConstraint('students', {
      fields: ['studentId'],
      type: 'unique',
      name: 'students_studentId_key'
    });
  }
};
