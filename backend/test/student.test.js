const request = require('supertest');
const app = require('../src/app');
const { Student } = require('../src/models');

jest.mock('../src/models');

describe('Student API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/student/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockStudent = {
        id: 1,
        className: 'Class A',
        name: 'Test Student',
        studentId: '12345'
      };

      Student.findOne.mockResolvedValue(mockStudent);

      const response = await request(app)
        .post('/api/student/login')
        .send({
          class: 'Class A',
          name: 'Test Student',
          studentId: '12345'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.data).toEqual(mockStudent);
      expect(response.body.token).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/student/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('请提供班级、姓名和学号');
    });

    it('should return 401 if student not found', async () => {
      Student.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/student/login')
        .send({
          class: 'Class A',
          name: 'Non Existent',
          studentId: '99999'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('学生信息不存在');
    });
  });

  describe('GET /api/student/:id', () => {
    it('should get student by id', async () => {
      const mockStudent = {
        id: 1,
        className: 'Class A',
        name: 'Test Student',
        studentId: '12345'
      };

      Student.findByPk.mockResolvedValue(mockStudent);

      const response = await request(app)
        .get('/api/student/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取成功');
      expect(response.body.data).toEqual(mockStudent);
    });

    it('should return 404 if student not found', async () => {
      Student.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/student/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('学生信息不存在');
    });
  });
});