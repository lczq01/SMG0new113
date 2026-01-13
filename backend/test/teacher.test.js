const request = require('supertest');
const app = require('../src/app');
const { Teacher } = require('../src/models');

jest.mock('../src/models');

describe('Teacher API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/teacher/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockTeacher = {
        id: 1,
        username: 'admin',
        password: '$2b$10$testpasswordhash'
      };

      Teacher.findOne.mockResolvedValue(mockTeacher);

      const response = await request(app)
        .post('/api/teacher/login')
        .send({
          username: 'admin',
          password: 'password'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.data).toEqual(mockTeacher);
      expect(response.body.token).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/teacher/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('请提供用户名和密码');
    });

    it('should return 401 if teacher not found', async () => {
      Teacher.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/teacher/login')
        .send({
          username: 'non-existent',
          password: 'password'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('用户名或密码错误');
    });
  });
});