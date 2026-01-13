import { Student, ExamRanking, Standard, Violation, CompleteData, ApiResponse, TeacherLogin, StudentLogin } from '../types';
import { mockStudents, mockRankings, mockStandards, mockViolations } from './mockData';

// API基础配置
const API_BASE_URL = 'http://localhost:3000/api';

// 是否使用静态数据模式（用于部署时）
const USE_STATIC_DATA = true;

// 从本地JSON文件加载数据
let staticDataCache: CompleteData | null = null;

async function loadStaticData(): Promise<CompleteData> {
  if (staticDataCache) {
    return staticDataCache;
  }
  
  try {
    // 尝试从本地data.json文件加载数据
    const response = await fetch('/data.json');
    if (response.ok) {
      const rawData = await response.json();
      
      // 转换数据类型，确保与接口定义匹配
      staticDataCache = {
        students: rawData.students.map((student: any) => ({
          ...student,
          id: String(student.id), // 确保id是字符串类型
          studentId: String(student.studentId) // 确保studentId是字符串类型
        })),
        rankings: rawData.rankings.map((ranking: any) => ({
          ...ranking,
          id: String(ranking.id), // 确保id是字符串类型
          studentId: String(ranking.studentId) // 确保studentId是字符串类型
        })),
        standards: rawData.standards.map((standard: any) => ({
          ...standard,
          id: String(standard.id), // 确保id是字符串类型
          studentId: String(standard.studentId) // 确保studentId是字符串类型
        })),
        violations: rawData.violations.map((violation: any) => ({
          ...violation,
          id: String(violation.id), // 确保id是字符串类型
          studentId: String(violation.studentId) // 确保studentId是字符串类型
        }))
      };
      
      return staticDataCache;
    }
    console.log('本地data.json文件不存在，使用mock数据');
  } catch (error) {
    console.log('加载本地data.json文件失败，使用mock数据:', error);
  }
  
  // 如果加载失败，使用mock数据
  staticDataCache = {
    students: mockStudents,
    rankings: mockRankings,
    standards: mockStandards,
    violations: mockViolations
  };
  
  return staticDataCache as CompleteData;
}

// 获取存储的token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 存储token
const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// 清除token
const clearToken = (): void => {
  localStorage.removeItem('token');
};

// 基础请求函数
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    // 处理非200响应
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || '请求失败',
        data: errorData.data,
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // 处理认证失败
    if (error.status === 401) {
      clearToken();
      // 可以在这里添加重定向到登录页的逻辑
    }
    
    return {
      success: false,
      message: error.message || '网络请求失败',
      data: error.data || null,
    };
  }
}

// 学生相关API
export const studentApi = {
  // 学生登录
  login: async (loginData: StudentLogin): Promise<ApiResponse<Student | null>> => {
    if (USE_STATIC_DATA) {
      // 使用静态数据登录
      const data = await loadStaticData();
      const student = data.students.find(
        s => s.class === loginData.class && s.name === loginData.name && s.studentId === loginData.studentId
      );
      
      if (student) {
        return {
          success: true,
          message: '登录成功',
          data: student
        };
      } else {
        return {
          success: false,
          message: '班级、姓名或学号不匹配',
          data: null
        };
      }
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || '登录失败',
          data: null,
        };
      }

      const data = await response.json();
      if (data.success && data.token) {
        setToken(data.token);
      }
      return data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '网络请求失败',
        data: null,
      };
    }
  },

  // 根据ID获取学生信息
  getById: async (id: string): Promise<ApiResponse<Student | null>> => {
    if (USE_STATIC_DATA) {
      const data = await loadStaticData();
      const student = data.students.find(s => s.id === id);
      return {
        success: true,
        message: '获取学生信息成功',
        data: student || null
      };
    }
    return request<Student | null>(`/student/${id}`);
  }
};

// 教师相关API
export const teacherApi = {
  // 教师登录
  login: async (loginData: TeacherLogin): Promise<ApiResponse<boolean>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || '登录失败',
          data: false,
        };
      }

      const data = await response.json();
      if (data.success && data.token) {
        setToken(data.token);
      }
      return data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '网络请求失败',
        data: false,
      };
    }
  }
};

// 考试排名相关API
export const rankingApi = {
  // 获取所有排名
  getAll: async (): Promise<ApiResponse<ExamRanking[]>> => {
    if (USE_STATIC_DATA) {
      const data = await loadStaticData();
      return {
        success: true,
        message: '获取排名成功',
        data: data.rankings
      };
    }
    return request<ExamRanking[]>('/ranking');
  },

  // 根据学生ID获取排名
  getByStudentId: async (studentId: string): Promise<ApiResponse<ExamRanking[]>> => {
    if (USE_STATIC_DATA) {
      const data = await loadStaticData();
      return {
        success: true,
        message: '获取排名成功',
        data: data.rankings.filter(r => r.studentId === studentId)
      };
    }
    return request<ExamRanking[]>(`/ranking/student/${studentId}`);
  },

  // 批量导入排名
  batchCreate: async (rankings: any[]): Promise<ApiResponse<any>> => {
    if (USE_STATIC_DATA) {
      return {
        success: true,
        message: '静态模式下不支持批量导入',
        data: null
      };
    }
    return request<any>('/ranking/batch', {
      method: 'POST',
      body: JSON.stringify(rankings),
    });
  }
};

// 标准设置相关API
export const standardApi = {
  // 获取所有标准
  getAll: async (): Promise<ApiResponse<Standard[]>> => {
    if (USE_STATIC_DATA) {
      const data = await loadStaticData();
      return {
        success: true,
        message: '获取标准成功',
        data: data.standards
      };
    }
    return request<Standard[]>('/standard');
  },

  // 根据学生ID获取标准
  getByStudentId: async (studentId: string): Promise<ApiResponse<Standard[]>> => {
    if (USE_STATIC_DATA) {
      const data = await loadStaticData();
      return {
        success: true,
        message: '获取标准成功',
        data: data.standards.filter(s => s.studentId === studentId)
      };
    }
    return request<Standard[]>(`/standard/student/${studentId}`);
  },

  // 创建标准
  create: async (standardData: { studentId: string; name: string; value: number }): Promise<ApiResponse<Standard>> => {
    if (USE_STATIC_DATA) {
      return {
        success: false,
        message: '静态模式下不支持创建标准',
        data: null as any
      };
    }
    return request<Standard>('/standard', {
      method: 'POST',
      body: JSON.stringify(standardData),
    });
  },

  // 更新标准
  update: async (id: string, updateData: { name?: string; value?: number }): Promise<ApiResponse<Standard>> => {
    if (USE_STATIC_DATA) {
      return {
        success: false,
        message: '静态模式下不支持更新标准',
        data: null as any
      };
    }
    return request<Standard>(`/standard/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // 删除标准
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    if (USE_STATIC_DATA) {
      return {
        success: false,
        message: '静态模式下不支持删除标准',
        data: false
      };
    }
    return request<boolean>(`/standard/${id}`, {
      method: 'DELETE',
    });
  }
};

// 违规记录相关API
export const violationApi = {
  // 获取所有违规记录
  getAll: async (): Promise<ApiResponse<Violation[]>> => {
    if (USE_STATIC_DATA) {
      const data = await loadStaticData();
      return {
        success: true,
        message: '获取违规记录成功',
        data: data.violations
      };
    }
    return request<Violation[]>('/violation');
  },

  // 根据学生ID获取违规记录
  getByStudentId: async (studentId: string): Promise<ApiResponse<Violation[]>> => {
    if (USE_STATIC_DATA) {
      const data = await loadStaticData();
      return {
        success: true,
        message: '获取违规记录成功',
        data: data.violations.filter(v => v.studentId === studentId)
      };
    }
    return request<Violation[]>(`/violation/student/${studentId}`);
  },

  // 创建违规记录
  create: async (violationData: { studentId: string; type: string; violationDate: string }): Promise<ApiResponse<Violation>> => {
    if (USE_STATIC_DATA) {
      return {
        success: false,
        message: '静态模式下不支持创建违规记录',
        data: null as any
      };
    }
    return request<Violation>('/violation', {
      method: 'POST',
      body: JSON.stringify(violationData),
    });
  },

  // 删除违规记录
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    if (USE_STATIC_DATA) {
      return {
        success: false,
        message: '静态模式下不支持删除违规记录',
        data: false
      };
    }
    return request<boolean>(`/violation/${id}`, {
      method: 'DELETE',
    });
  }
};

// 数据导出相关API
export const exportApi = {
  // 导出完整数据
  exportData: async (): Promise<ApiResponse<CompleteData>> => {
    return request<CompleteData>('/export');
  }
};

// 学生信息管理API
export const studentManagementApi = {
  // 获取所有学生
  getAll: async (): Promise<ApiResponse<Student[]>> => {
    // 设置pageSize=10000获取所有学生数据，确保能获取足够多的学生
    const response = await request<any>('/student?pageSize=10000&page=1');
    // 处理分页响应，提取students数组
    if (response.success && response.data && response.data.students) {
      return {
        ...response,
        data: response.data.students
      };
    }
    // 保持向后兼容
    return response;
  },
  
  // 创建单个学生
  create: async (studentData: { class: string; name: string; studentId: string }): Promise<ApiResponse<Student>> => {
    return request<Student>('/student', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },
  
  // 更新学生信息
  update: async (id: string, studentData: { class: string; name: string; studentId: string }): Promise<ApiResponse<Student>> => {
    return request<Student>(`/student/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },
  
  // 删除学生
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    return request<boolean>(`/student/${id}`, {
      method: 'DELETE',
    });
  },
  
  // 批量创建学生
  batchCreate: async (students: Array<{ class: string; name: string; studentId: string }>): Promise<ApiResponse<any>> => {
    return request<any>('/student/batch', {
      method: 'POST',
      body: JSON.stringify(students),
    });
  }
};

// 班级管理API
export const classApi = {
  // 获取所有班级
  getAll: async (): Promise<ApiResponse<Array<{name: string, studentCount: number}>>> => {
    return request<Array<{name: string, studentCount: number}>>('/class');
  },
  
  // 创建新班级
  create: async (className: string): Promise<ApiResponse<any>> => {
    return request<any>('/class', {
      method: 'POST',
      body: JSON.stringify({ className }),
    });
  },
  
  // 更新班级名称
  update: async (oldClassName: string, newClassName: string): Promise<ApiResponse<any>> => {
    return request<any>(`/class/${oldClassName}`, {
      method: 'PUT',
      body: JSON.stringify({ newClassName }),
    });
  },
  
  // 删除班级
  delete: async (className: string): Promise<ApiResponse<any>> => {
    return request<any>(`/class/${className}`, {
      method: 'DELETE',
    });
  }
};

// 预警管理API
export const alertApi = {
  // 获取所有预警
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return request<any[]>('/alert');
  }
};