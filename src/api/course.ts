import request from '../utils/request';

export function getCourseList(params?: any) {
    return request({ url: '/course/list', method: 'get', params });
}

export function getPendingCourseList() {
    return request({ url: '/course/pending', method: 'get' });
}

export function approveCourse(id: number, status: number) {
    return request({
        url: `/course/approve/${id}`,
        method: 'post',
        params: { status }
    });
}

export function addCourse(data: any) {
    return request({ url: '/course/add', method: 'post', data });
}

export function updateCourse(data: any) {
    return request({ url: '/course/update', method: 'post', data });
}

export function deleteCourse(id: number) {
    return request({ url: `/course/delete/${id}`, method: 'delete' });
}

export function getCourseDetail(id: number) {
    return request({ url: `/course/detail/${id}`, method: 'get' })
} 