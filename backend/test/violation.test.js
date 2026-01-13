const request = require('supertest');
const app = require('../src/app');
const { Violation } = require('../src/models');

jest.mock('../src/models');

describe('Violation API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/violation', () => {
    it('should get all violations', async () => {
      const mockViolations = [
        {
          id: 1,
          studentId: 1,
          type: 'Late',
          violationDate: new Date('2024-01-01')
        },
        {
          id: 2,
          studentId: 2,
          type: 'Absent',
          violationDate: new Date('2024-01-02')
        }
      ];

      Violation.findAll.mockResolvedValue(mockViolations);

      const response = await request(app)
        .get('/api/violation');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取成功');
      expect(response.body.data).toEqual(mockViolations);
    });
  });

  describe('GET /api/violation/student/:studentId', () => {
    it('should get violations by student id', async () => {
      const mockViolations = [
        {
          id: 1,
          studentId: 1,
          type: 'Late',
          violationDate: new Date('2024-01-01')
        }
      ];

      Violation.findAll.mockResolvedValue(mockViolations);

      const response = await request(app)
        .get('/api/violation/student/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取成功');
      expect(response.body.data).toEqual(mockViolations);
    });
  });

  describe('POST /api/violation', () => {
    it('should create a new violation', async () => {
      const mockViolation = {
        id: 1,
        studentId: 1,
        type: 'Late',
        violationDate: new Date('2024-01-01')
      };

      Violation.create.mockResolvedValue(mockViolation);

      const response = await request(app)
        .post('/api/violation')
        .send({
          studentId: 1,
          type: 'Late',
          violationDate: '2024-01-01'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('添加成功');
      expect(response.body.data).toEqual(mockViolation);
    });
  });

  describe('DELETE /api/violation/:id', () => {
    it('should delete a violation', async () => {
      const mockViolation = {
        id: 1
      };

      Violation.findByPk.mockResolvedValue(mockViolation);
      Violation.destroy.mockResolvedValue(1);

      const response = await request(app)
        .delete('/api/violation/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('删除成功');
    });

    it('should return 404 if violation not found', async () => {
      Violation.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/violation/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('违规记录不存在');
    });
  });
});