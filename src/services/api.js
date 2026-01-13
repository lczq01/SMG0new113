"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertApi = exports.classApi = exports.studentManagementApi = exports.exportApi = exports.violationApi = exports.standardApi = exports.rankingApi = exports.teacherApi = exports.studentApi = void 0;
const mockData_1 = require("./mockData");
// API基础配置
const API_BASE_URL = 'http://localhost:3000/api';
// 是否使用静态数据模式（用于部署时）
const USE_STATIC_DATA = true;
// 从本地JSON文件加载数据
let staticDataCache = null;
async function loadStaticData() {
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
                students: rawData.students.map((student) => ({
                    ...student,
                    id: String(student.id), // 确保id是字符串类型
                    studentId: String(student.studentId) // 确保studentId是字符串类型
                })),
                rankings: rawData.rankings.map((ranking) => ({
                    ...ranking,
                    id: String(ranking.id), // 确保id是字符串类型
                    studentId: String(ranking.studentId) // 确保studentId是字符串类型
                })),
                standards: rawData.standards.map((standard) => ({
                    ...standard,
                    id: String(standard.id), // 确保id是字符串类型
                    studentId: String(standard.studentId) // 确保studentId是字符串类型
                })),
                violations: rawData.violations.map((violation) => ({
                    ...violation,
                    id: String(violation.id), // 确保id是字符串类型
                    studentId: String(violation.studentId) // 确保studentId是字符串类型
                }))
            };
            return staticDataCache;
        }
        console.log('本地data.json文件不存在，使用mock数据');
    }
    catch (error) {
        console.log('加载本地data.json文件失败，使用mock数据:', error);
    }
    // 如果加载失败，使用mock数据
    staticDataCache = {
        students: mockData_1.mockStudents,
        rankings: mockData_1.mockRankings,
        standards: mockData_1.mockStandards,
        violations: mockData_1.mockViolations
    };
    return staticDataCache;
}
// 获取存储的token
const getToken = () => {
    return localStorage.getItem('token');
};
// 存储token
const setToken = (token) => {
    localStorage.setItem('token', token);
};
// 清除token
const clearToken = () => {
    localStorage.removeItem('token');
};
// 基础请求函数
async function request(url, options = {}) {
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
    }
    catch (error) {
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
exports.studentApi = {
    // 学生登录
    login: async (loginData) => {
        if (USE_STATIC_DATA) {
            // 使用静态数据登录
            const data = await loadStaticData();
            const student = data.students.find(s => s.class === loginData.class && s.name === loginData.name && s.studentId === loginData.studentId);
            if (student) {
                return {
                    success: true,
                    message: '登录成功',
                    data: student
                };
            }
            else {
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
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '网络请求失败',
                data: null,
            };
        }
    },
    // 根据ID获取学生信息
    getById: async (id) => {
        if (USE_STATIC_DATA) {
            const data = await loadStaticData();
            const student = data.students.find(s => s.id === id);
            return {
                success: true,
                message: '获取学生信息成功',
                data: student || null
            };
        }
        return request(`/student/${id}`);
    }
};
// 教师相关API
exports.teacherApi = {
    // 教师登录
    login: async (loginData) => {
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
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '网络请求失败',
                data: false,
            };
        }
    }
};
// 考试排名相关API
exports.rankingApi = {
    // 获取所有排名
    getAll: async () => {
        if (USE_STATIC_DATA) {
            const data = await loadStaticData();
            return {
                success: true,
                message: '获取排名成功',
                data: data.rankings
            };
        }
        return request('/ranking');
    },
    // 根据学生ID获取排名
    getByStudentId: async (studentId) => {
        if (USE_STATIC_DATA) {
            const data = await loadStaticData();
            return {
                success: true,
                message: '获取排名成功',
                data: data.rankings.filter(r => r.studentId === studentId)
            };
        }
        return request(`/ranking/student/${studentId}`);
    },
    // 批量导入排名
    batchCreate: async (rankings) => {
        if (USE_STATIC_DATA) {
            return {
                success: true,
                message: '静态模式下不支持批量导入',
                data: null
            };
        }
        return request('/ranking/batch', {
            method: 'POST',
            body: JSON.stringify(rankings),
        });
    }
};
// 标准设置相关API
exports.standardApi = {
    // 获取所有标准
    getAll: async () => {
        if (USE_STATIC_DATA) {
            const data = await loadStaticData();
            return {
                success: true,
                message: '获取标准成功',
                data: data.standards
            };
        }
        return request('/standard');
    },
    // 根据学生ID获取标准
    getByStudentId: async (studentId) => {
        if (USE_STATIC_DATA) {
            const data = await loadStaticData();
            return {
                success: true,
                message: '获取标准成功',
                data: data.standards.filter(s => s.studentId === studentId)
            };
        }
        return request(`/standard/student/${studentId}`);
    },
    // 创建标准
    create: async (standardData) => {
        if (USE_STATIC_DATA) {
            return {
                success: false,
                message: '静态模式下不支持创建标准',
                data: null
            };
        }
        return request('/standard', {
            method: 'POST',
            body: JSON.stringify(standardData),
        });
    },
    // 更新标准
    update: async (id, updateData) => {
        if (USE_STATIC_DATA) {
            return {
                success: false,
                message: '静态模式下不支持更新标准',
                data: null
            };
        }
        return request(`/standard/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    },
    // 删除标准
    delete: async (id) => {
        if (USE_STATIC_DATA) {
            return {
                success: false,
                message: '静态模式下不支持删除标准',
                data: false
            };
        }
        return request(`/standard/${id}`, {
            method: 'DELETE',
        });
    }
};
// 违规记录相关API
exports.violationApi = {
    // 获取所有违规记录
    getAll: async () => {
        if (USE_STATIC_DATA) {
            const data = await loadStaticData();
            return {
                success: true,
                message: '获取违规记录成功',
                data: data.violations
            };
        }
        return request('/violation');
    },
    // 根据学生ID获取违规记录
    getByStudentId: async (studentId) => {
        if (USE_STATIC_DATA) {
            const data = await loadStaticData();
            return {
                success: true,
                message: '获取违规记录成功',
                data: data.violations.filter(v => v.studentId === studentId)
            };
        }
        return request(`/violation/student/${studentId}`);
    },
    // 创建违规记录
    create: async (violationData) => {
        if (USE_STATIC_DATA) {
            return {
                success: false,
                message: '静态模式下不支持创建违规记录',
                data: null
            };
        }
        return request('/violation', {
            method: 'POST',
            body: JSON.stringify(violationData),
        });
    },
    // 删除违规记录
    delete: async (id) => {
        if (USE_STATIC_DATA) {
            return {
                success: false,
                message: '静态模式下不支持删除违规记录',
                data: false
            };
        }
        return request(`/violation/${id}`, {
            method: 'DELETE',
        });
    }
};
// 数据导出相关API
exports.exportApi = {
    // 导出完整数据
    exportData: async () => {
        return request('/export');
    }
};
// 学生信息管理API
exports.studentManagementApi = {
    // 获取所有学生
    getAll: async () => {
        // 设置pageSize=10000获取所有学生数据，确保能获取足够多的学生
        const response = await request('/student?pageSize=10000&page=1');
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
    create: async (studentData) => {
        return request('/student', {
            method: 'POST',
            body: JSON.stringify(studentData),
        });
    },
    // 更新学生信息
    update: async (id, studentData) => {
        return request(`/student/${id}`, {
            method: 'PUT',
            body: JSON.stringify(studentData),
        });
    },
    // 删除学生
    delete: async (id) => {
        return request(`/student/${id}`, {
            method: 'DELETE',
        });
    },
    // 批量创建学生
    batchCreate: async (students) => {
        return request('/student/batch', {
            method: 'POST',
            body: JSON.stringify(students),
        });
    }
};
// 班级管理API
exports.classApi = {
    // 获取所有班级
    getAll: async () => {
        return request('/class');
    },
    // 创建新班级
    create: async (className) => {
        return request('/class', {
            method: 'POST',
            body: JSON.stringify({ className }),
        });
    },
    // 更新班级名称
    update: async (oldClassName, newClassName) => {
        return request(`/class/${oldClassName}`, {
            method: 'PUT',
            body: JSON.stringify({ newClassName }),
        });
    },
    // 删除班级
    delete: async (className) => {
        return request(`/class/${className}`, {
            method: 'DELETE',
        });
    }
};
// 预警管理API
exports.alertApi = {
    // 获取所有预警
    getAll: async () => {
        return request('/alert');
    }
};
