import request from '@/utils/request'

// 获取会议列表
export function fetchMeetingList(params) {
  // params: { name, creator, startDate, endDate }
  return request({
    url: '/meeting',
    method: 'get',
    params
  })
}

// 新增会议
export function addMeeting(data) {
  // data: { name, startTime, endTime, creator, content }
  return request({
    url: '/meeting',
    method: 'post',
    data
  })
}

// 编辑会议
export function editMeeting(id, data) {
  // id: 会议ID, data: { name, startTime, endTime, creator, content }
  return request({
    url: `/meeting/${id}`,
    method: 'put',
    data
  })
}

// 获取会议详情
export function getMeetingDetail(id) {
  return request({
    url: `/meeting/${id}`,
    method: 'get'
  })
}

// 删除会议
export function deleteMeeting(id) {
  return request({
    url: `/meeting/${id}`,
    method: 'delete'
  })
}

// 获取待审核会议列表
export function fetchPendingMeetings() {
  return request({
    url: '/meeting/pending',
    method: 'get'
  })
}

// 审核会议
export function auditMeeting(id, status) {
  return request({
    url: `/meeting/audit/${id}`,
    method: 'put',
    params: { status }
  })
} 