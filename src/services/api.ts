import { Student, ExamRanking, Standard, Violation, CompleteData, ApiResponse, TeacherLogin, StudentLogin } from '../types';

// API基础配置
const API_BASE_URL = 'http://localhost:3000/api';

// 静态数据文件路径 - 学生端从这个文件获取所有数据
const STATIC_DATA_PATH = '/data.json';

// 缓存完整数据，避免重复加载
let cachedData: CompleteData | null = null;

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

// 加载完整数据
async function loadCompleteData(): Promise<CompleteData> {
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await fetch(STATIC_DATA_PATH);
    if (!response.ok) {
      throw new Error('无法加载数据文件');
    }
    
    const data = await response.json();
    cachedData = data;
    return data;
  } catch (error) {
    console.error('加载数据失败:', error);
    throw error;
  }
}

// 学生相关API
export const studentApi = {
  // 学生登录 - 从JSON文件中匹配班级、姓名、学号
  login: async (loginData: StudentLogin): Promise<ApiResponse<Student | null>> => {
    try {
      const data = await loadCompleteData();
      
      // 在JSON数据中查找匹配的学生
      const student = data.students.find(
        s => s.class === loginData.class && 
             s.name === loginData.name && 
             s.studentId === loginData.studentId
      );
      
      if (student) {
        return {
          success: true,
          message: '登录成功',
          data: student,
        };
      } else {
        return {
          success: false,
          message: '班级、姓名或学号不正确',
          data: null,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: '加载数据失败',
        data: null,
      };
    }
  },

  // 根据ID获取学生信息
  getById: async (id: string): Promise<ApiResponse<Student | null>> => {
    try {
      const data = await loadCompleteData();
      const student = data.students.find(s => s.id === id);
      
      return {
        success: true,
        message: '获取成功',
        data: student || null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: '加载数据失败',
        data: null,
      };
    }
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
    return request<ExamRanking[]>('/ranking');
  },

  // 根据学生ID获取排名
  getByStudentId: async (studentId: string): Promise<ApiResponse<ExamRanking[]>> => {
    return request<ExamRanking[]>(`/ranking/student/${studentId}`);
  },

  // 批量导入排名 - 学生端不需要此功能
  batchCreate: async (rankings: any[]): Promise<ApiResponse<any>> => {
    return {
      success: false,
      message: '学生端不支持此功能',
      data: null,
    };
  }
};

// 标准设置相关API
export const standardApi = {
  // 获取所有标准
  getAll: async (): Promise<ApiResponse<Standard[]>> => {
    return request<Standard[]>('/standard');
  },

  // 根据学生ID获取标准
  getByStudentId: async (studentId: string): Promise<ApiResponse<Standard[]>> => {
    return request<Standard[]>(`/standard/student/${studentId}`);
  },

  // 创建标准 - 学生端不需要此功能
  create: async (standardData: { studentId: string; name: string; value: number }): Promise<ApiResponse<Standard>> => {
    return {
      success: false,
      message: '学生端不支持此功能',
      data: null,
    };
  },

  // 更新标准 - 学生端不需要此功能
  update: async (id: string, updateData: { name?: string; value?: number }): Promise<ApiResponse<Standard>> => {
    return {
      success: false,
      message: '学生端不支持此功能',
      data: null,
    };
  },

  // 删除标准 - 学生端不需要此功能
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    return {
      success: false,
      message: '学生端不支持此功能',
      data: false,
    };
  }
};

// 违规记录相关API
export const violationApi = {
  // 获取所有违规记录
  getAll: async (): Promise<ApiResponse<Violation[]>> => {
    return request<Violation[]>('/violation');
  },

  // 根据学生ID获取违规记录
  getByStudentId: async (studentId: string): Promise<ApiResponse<Violation[]>> => {
    return request<Violation[]>(`/violation/student/${studentId}`);
  },

  // 创建违规记录 - 学生端不需要此功能
  create: async (violationData: { studentId: string; type: string; violationDate: string }): Promise<ApiResponse<Violation>> => {
    return {
      success: false,
      message: '学生端不支持此功能',
      data: null,
    };
  },

  // 删除违规记录 - 学生端不需要此功能
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    return {
      success: false,
      message: '学生端不支持此功能',
      data: false,
    };
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
  
  // 根据ID获取学生信息
  getById: async (id: string): Promise<ApiResponse<Student>> => {
    return request<Student>(`/student/${id}`);
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