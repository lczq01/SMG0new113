const request = require('supertest');
const app = require('../src/app');
const { Standard } = require('../src/models');

jest.mock('../src/models');

describe('Standard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/standard', () => {
    it('should get all standards', async () => {
      const mockStandards = [
        {
          id: 1,
          studentId: 1,
          name: 'Attendance',
          value: 95
        },
        {
          id: 2,
          studentId: 1,
          name: 'Homework',
          value: 90
        }
      ];

      Standard.findAll.mockResolvedValue(mockStandards);

      const response = await request(app)
        .get('/api/standard');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取成功');
      expect(response.body.data).toEqual(mockStandards);
    });
  });

  describe('GET /api/standard/student/:studentId', () => {
    it('should get standards by student id', async () => {
      const mockStandards = [
        {
          id: 1,
          studentId: 1,
          name: 'Attendance',
          value: 95
        }
      ];

      Standard.findAll.mockResolvedValue(mockStandards);

      const response = await request(app)
        .get('/api/standard/student/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取成功');
      expect(response.body.data).toEqual(mockStandards);
    });
  });

  describe('POST /api/standard', () => {
    it('should create a new standard', async () => {
      const mockStandard = {
        id: 1,
        studentId: 1,
        name: 'Attendance',
        value: 95
      };

      Standard.create.mockResolvedValue(mockStandard);

      const response = await request(app)
        .post('/api/standard')
        .send({
          studentId: 1,
          name: 'Attendance',
          value: 95
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('添加成功');
      expect(response.body.data).toEqual(mockStandard);
    });
  });

  describe('PUT /api/standard/:id', () => {
    it('should update a standard', async () => {
      const mockStandard = {
        id: 1,
        studentId: 1,
        name: 'Attendance',
        value: 98
      };

      Standard.findByPk.mockResolvedValue(mockStandard);
      Standard.update.mockResolvedValue([1]);

      const response = await request(app)
        .put('/api/standard/1')
        .send({
          value: 98
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('更新成功');
    });

    it('should return 404 if standard not found', async () => {
      Standard.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/standard/999')
        .send({
          value: 98
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('标准不存在');
    });
  });

  describe('DELETE /api/standard/:id', () => {
    it('should delete a standard', async () => {
      const mockStandard = {
        id: 1
      };

      Standard.findByPk.mockResolvedValue(mockStandard);
      Standard.destroy.mockResolvedValue(1);

      const response = await request(app)
        .delete('/api/standard/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('删除成功');
    });

    it('should return 404 if standard not found', async () => {
      Standard.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/standard/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('标准不存在');
    });
  });
});