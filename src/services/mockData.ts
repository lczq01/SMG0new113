import { Student, ExamRanking, Standard, Violation } from '../types';

// 模拟学生数据
export const mockStudents: Student[] = [
  {
    id: '1',
    class: '高一(1)班',
    name: '张三',
    studentId: '2024001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    class: '高一(1)班',
    name: '李四',
    studentId: '2024002',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    class: '高一(2)班',
    name: '王五',
    studentId: '2024003',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// 模拟考试排名数据
export const mockRankings: ExamRanking[] = [
  {
    id: '1',
    studentId: '1',
    examName: '期中考试',
    ranking: 52,
    createdAt: '2024-10-01T00:00:00Z'
  },
  {
    id: '2',
    studentId: '1',
    examName: '期末考试',
    ranking: 151,
    createdAt: '2024-11-01T00:00:00Z'
  },
  {
    id: '3',
    studentId: '1',
    examName: '月考',
    ranking: 158,
    createdAt: '2024-12-01T00:00:00Z'
  },
  {
    id: '4',
    studentId: '2',
    examName: '期中考试',
    ranking: 30,
    createdAt: '2024-10-01T00:00:00Z'
  },
  {
    id: '5',
    studentId: '2',
    examName: '期末考试',
    ranking: 25,
    createdAt: '2024-11-01T00:00:00Z'
  },
  {
    id: '6',
    studentId: '2',
    examName: '月考',
    ranking: 20,
    createdAt: '2024-12-01T00:00:00Z'
  },
  {
    id: '7',
    studentId: '3',
    examName: '期中考试',
    ranking: 80,
    createdAt: '2024-10-01T00:00:00Z'
  },
  {
    id: '8',
    studentId: '3',
    examName: '期末考试',
    ranking: 90,
    createdAt: '2024-11-01T00:00:00Z'
  },
  {
    id: '9',
    studentId: '3',
    examName: '月考',
    ranking: 95,
    createdAt: '2024-12-01T00:00:00Z'
  }
];

// 模拟标准设置数据
export const mockStandards: Standard[] = [
  {
    id: '1',
    studentId: '1',
    name: '作业标准',
    value: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    studentId: '1',
    name: '课堂表现',
    value: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    studentId: '2',
    name: '作业标准',
    value: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    studentId: '2',
    name: '课堂表现',
    value: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    studentId: '3',
    name: '作业标准',
    value: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    studentId: '3',
    name: '课堂表现',
    value: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// 模拟违规记录数据
export const mockViolations: Violation[] = [
  {
    id: '1',
    studentId: '1',
    type: '迟到',
    violationDate: '2024-01-15T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    studentId: '1',
    type: '未完成作业',
    violationDate: '2024-02-01T00:00:00Z',
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    studentId: '3',
    type: '迟到',
    violationDate: '2024-01-20T00:00:00Z',
    createdAt: '2024-01-20T00:00:00Z'
  }
];

// 模拟教师账号
export const mockTeacher = {
  username: 'teacher',
  password: 'teacher123'
};