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
    // 插入考试排名数据
    await queryInterface.bulkInsert('exam_rankings', [
      // 张三的排名
      {
        studentId: 1,
        examName: '期中考试',
        ranking: 52,
        createdAt: new Date('2024-10-01')
      },
      {
        studentId: 1,
        examName: '期末考试',
        ranking: 151,
        createdAt: new Date('2024-11-01')
      },
      {
        studentId: 1,
        examName: '月考',
        ranking: 158,
        createdAt: new Date('2024-12-01')
      },
      // 李四的排名
      {
        studentId: 2,
        examName: '期中考试',
        ranking: 30,
        createdAt: new Date('2024-10-01')
      },
      {
        studentId: 2,
        examName: '期末考试',
        ranking: 25,
        createdAt: new Date('2024-11-01')
      },
      {
        studentId: 2,
        examName: '月考',
        ranking: 20,
        createdAt: new Date('2024-12-01')
      },
      // 王五的排名
      {
        studentId: 3,
        examName: '期中考试',
        ranking: 80,
        createdAt: new Date('2024-10-01')
      },
      {
        studentId: 3,
        examName: '期末考试',
        ranking: 90,
        createdAt: new Date('2024-11-01')
      },
      {
        studentId: 3,
        examName: '月考',
        ranking: 95,
        createdAt: new Date('2024-12-01')
      },
      // 赵六的排名
      {
        studentId: 4,
        examName: '期中考试',
        ranking: 120,
        createdAt: new Date('2024-10-01')
      },
      {
        studentId: 4,
        examName: '期末考试',
        ranking: 110,
        createdAt: new Date('2024-11-01')
      },
      {
        studentId: 4,
        examName: '月考',
        ranking: 105,
        createdAt: new Date('2024-12-01')
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
    // 删除考试排名数据
    await queryInterface.bulkDelete('exam_rankings', null, {});
  }
};
