const request = require('supertest');
const app = require('../src/app');
const { Alert, Student } = require('../src/models');

jest.mock('../src/models');

describe('Alert API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/alert', () => {
    it('should get all alerts with student data', async () => {
      const mockAlerts = [
        {
          id: 1,
          studentId: 1,
          type: 'continuous_declining',
          typeText: '连续退步',
          reason: '连续三次考试排名下降',
          student: {
            id: 1,
            name: 'Student 1'
          }
        }
      ];

      Alert.findAll.mockResolvedValue(mockAlerts);

      const response = await request(app)
        .get('/api/alert');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取预警信息成功');
      expect(response.body.data).toEqual(mockAlerts);
    });
  });

  describe('GET /api/alert/student/:studentId', () => {
    it('should get alerts by student id', async () => {
      const mockAlerts = [
        {
          id: 1,
          studentId: 1,
          type: 'continuous_declining',
          typeText: '连续退步',
          reason: '连续三次考试排名下降'
        }
      ];

      Alert.findAll.mockResolvedValue(mockAlerts);

      const response = await request(app)
        .get('/api/alert/student/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取学生预警信息成功');
      expect(response.body.data).toEqual(mockAlerts);
    });
  });

  describe('GET /api/alert/type/:type', () => {
    it('should get alerts by type', async () => {
      const mockAlerts = [
        {
          id: 1,
          studentId: 1,
          type: 'continuous_declining',
          typeText: '连续退步',
          reason: '连续三次考试排名下降'
        }
      ];

      Alert.findAll.mockResolvedValue(mockAlerts);

      const response = await request(app)
        .get('/api/alert/type/continuous_declining');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取预警信息成功');
      expect(response.body.data).toEqual(mockAlerts);
    });
  });

  describe('GET /api/alert/stats', () => {
    it('should get alert statistics', async () => {
      const mockStats = [
        {
          type: 'continuous_declining',
          typeText: '连续退步',
          count: 5
        },
        {
          type: 'multiple_violations',
          typeText: '多次违规',
          count: 3
        }
      ];

      Alert.findAll.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/alert/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('获取预警统计信息成功');
      expect(response.body.data).toEqual(mockStats);
    });
  });
});