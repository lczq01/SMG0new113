// 学生信息类型
export interface Student {
  id: string;
  class: string;
  name: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
}

// 考试排名类型
export interface ExamRanking {
  id: string;
  studentId: string;
  examName: string;
  ranking: number;
  createdAt: string;
}

// 标准设置类型
export interface Standard {
  id: string;
  studentId: string;
  name: string;
  value: number;
  createdAt: string;
  updatedAt: string;
}

// 违规记录类型
export interface Violation {
  id: string;
  studentId: string;
  type: string;
  violationDate: string;
  createdAt: string;
}

// 预警信息类型
export interface Alert {
  id: string;
  studentId: string;
  type: 'continuous_declining' | 'multiple_violations' | 'declining_and_violation';
  typeText: string;
  reason: string;
  createdAt: string;
}

// 完整数据包类型
export interface CompleteData {
  students: Student[];
  rankings: ExamRanking[];
  standards: Standard[];
  violations: Violation[];
}

// 教师登录信息类型
export interface TeacherLogin {
  username: string;
  password: string;
}

// 学生登录信息类型
export interface StudentLogin {
  class: string;
  name: string;
  studentId: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}