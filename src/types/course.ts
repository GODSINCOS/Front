export interface Course {
    id?: number;
    name: string;
    summary: string;
    author: string;
    orderNum?: number;
    cover?: string;
    video?: string;
    content?: string;
    createTime?: string;
    updateTime?: string;
    status?: number; // 0: 待审核, 1: 已通过, 2: 已拒绝
    userId?: number;
} 