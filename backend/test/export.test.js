const request = require('supertest');
const app = require('../src/app');
const { Student, ExamRanking, Standard, Violation } = require('../src/models');

jest.mock('../src/models');

describe('Export API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/export/students', () => {
    it('should export all students with related data', async () => {
      const mockStudents = [
        {
          id: 1,
          className: 'Class A',
          name: 'Student 1',
          studentId: '12345',
          standards: [],
          rankings: [],
          violations: []
        }
      ];

      Student.findAll.mockResolvedValue(mockStudents);

      const response = await request(app)
        .get('/api/export/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('导出成功');
      expect(response.body.data).toEqual(mockStudents);
    });
  });

  describe('GET /api/export/rankings', () => {
    it('should export all rankings with student data', async () => {
      const mockRankings = [
        {
          id: 1,
          studentId: 1,
          examName: 'Midterm',
          ranking: 1,
          student: {
            id: 1,
            name: 'Student 1'
          }
        }
      ];

      ExamRanking.findAll.mockResolvedValue(mockRankings);

      const response = await request(app)
        .get('/api/export/rankings');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('导出成功');
      expect(response.body.data).toEqual(mockRankings);
    });
  });

  describe('GET /api/export/standards', () => {
    it('should export all standards with student data', async () => {
      const mockStandards = [
        {
          id: 1,
          studentId: 1,
          name: 'Attendance',
          value: 95,
          student: {
            id: 1,
            name: 'Student 1'
          }
        }
      ];

      Standard.findAll.mockResolvedValue(mockStandards);

      const response = await request(app)
        .get('/api/export/standards');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('导出成功');
      expect(response.body.data).toEqual(mockStandards);
    });
  });

  describe('GET /api/export/violations', () => {
    it('should export all violations with student data', async () => {
      const mockViolations = [
        {
          id: 1,
          studentId: 1,
          type: 'Late',
          violationDate: new Date('2024-01-01'),
          student: {
            id: 1,
            name: 'Student 1'
          }
        }
      ];

      Violation.findAll.mockResolvedValue(mockViolations);

      const response = await request(app)
        .get('/api/export/violations');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('导出成功');
      expect(response.body.data).toEqual(mockViolations);
    });
  });

  describe('GET /api/export/all', () => {
    it('should export all data', async () => {
      const mockData = {
        students: [],
        rankings: [],
        standards: [],
        violations: []
      };

      Student.findAll.mockResolvedValue(mockData.students);
      ExamRanking.findAll.mockResolvedValue(mockData.rankings);
      Standard.findAll.mockResolvedValue(mockData.standards);
      Violation.findAll.mockResolvedValue(mockData.violations);

      const response = await request(app)
        .get('/api/export/all');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('导出成功');
      expect(response.body.data).toEqual(mockData);
    });
  });
});