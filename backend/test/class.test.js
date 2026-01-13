const request = require('supertest');
const app = require('../src/app');
const { Student } = require('../src/models');

jest.mock('../src/models');

describe('Class API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/class', () => {
    it('should get all classes', async () => {
      const mockStudents = [
        { className: 'Class A' },
        { className: 'Class A' },
        { className: 'Class B' }
      ];

      Student.findAll.mockResolvedValue(mockStudents);

      const response = await request(app)
        .get('/api/class');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取成功');
      expect(response.body.data).toEqual(['Class A', 'Class B']);
    });
  });

  describe('GET /api/class/:className/students', () => {
    it('should get students by class name', async () => {
      const mockStudents = [
        {
          id: 1,
          className: 'Class A',
          name: 'Student 1',
          studentId: '12345'
        },
        {
          id: 2,
          className: 'Class A',
          name: 'Student 2',
          studentId: '67890'
        }
      ];

      Student.findAll.mockResolvedValue(mockStudents);

      const response = await request(app)
        .get('/api/class/Class A/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取成功');
      expect(response.body.data).toEqual(mockStudents);
    });
  });
});