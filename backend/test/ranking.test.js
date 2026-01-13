const request = require('supertest');
const app = require('../src/app');
const { ExamRanking } = require('../src/models');

jest.mock('../src/models');

describe('Ranking API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/ranking', () => {
    it('should get all rankings', async () => {
      const mockRankings = [
        {
          id: 1,
          studentId: 1,
          examName: 'Midterm',
          ranking: 1
        },
        {
          id: 2,
          studentId: 2,
          examName: 'Midterm',
          ranking: 2
        }
      ];

      ExamRanking.findAll.mockResolvedValue(mockRankings);

      const response = await request(app)
        .get('/api/ranking');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取成功');
      expect(response.body.data).toEqual(mockRankings);
    });
  });

  describe('GET /api/ranking/student/:studentId', () => {
    it('should get rankings by student id', async () => {
      const mockRankings = [
        {
          id: 1,
          studentId: 1,
          examName: 'Midterm',
          ranking: 1
        }
      ];

      ExamRanking.findAll.mockResolvedValue(mockRankings);

      const response = await request(app)
        .get('/api/ranking/student/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取成功');
      expect(response.body.data).toEqual(mockRankings);
    });
  });

  describe('POST /api/ranking', () => {
    it('should create a new ranking', async () => {
      const mockRanking = {
        id: 1,
        studentId: 1,
        examName: 'Final',
        ranking: 1
      };

      ExamRanking.create.mockResolvedValue(mockRanking);

      const response = await request(app)
        .post('/api/ranking')
        .send({
          studentId: 1,
          examName: 'Final',
          ranking: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('添加成功');
      expect(response.body.data).toEqual(mockRanking);
    });
  });

  describe('PUT /api/ranking/:id', () => {
    it('should update a ranking', async () => {
      const mockRanking = {
        id: 1,
        studentId: 1,
        examName: 'Midterm',
        ranking: 2
      };

      ExamRanking.findByPk.mockResolvedValue(mockRanking);
      ExamRanking.update.mockResolvedValue([1]);

      const response = await request(app)
        .put('/api/ranking/1')
        .send({
          ranking: 2
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('更新成功');
    });

    it('should return 404 if ranking not found', async () => {
      ExamRanking.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/ranking/999')
        .send({
          ranking: 2
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('排名记录不存在');
    });
  });

  describe('DELETE /api/ranking/:id', () => {
    it('should delete a ranking', async () => {
      const mockRanking = {
        id: 1
      };

      ExamRanking.findByPk.mockResolvedValue(mockRanking);
      ExamRanking.destroy.mockResolvedValue(1);

      const response = await request(app)
        .delete('/api/ranking/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('删除成功');
    });

    it('should return 404 if ranking not found', async () => {
      ExamRanking.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/ranking/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('排名记录不存在');
    });
  });
});