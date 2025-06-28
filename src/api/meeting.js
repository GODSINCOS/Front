import request from '@/utils/request'

// 获取会议列表
export function fetchMeetingList(params) {
  // params: { name, creator, startDate, endDate }
  return request({
    url: '/meeting/list',
    method: 'get',
    params
  })
}

// 新增会议
export function addMeeting(data) {
  // data: { name, startTime, endTime, creator, content }
  return request({
    url: '/meeting/create',
    method: 'post',
    data
  })
}

// 编辑会议
export function editMeeting(data) {
  // data: { id, name, startTime, endTime, creator, content }
  return request({
    url: '/meeting/update',
    method: 'put',
    data
  })
}

// 获取会议详情
export function getMeetingDetail(id) {
  return request({
    url: `/meeting/detail/${id}`,
    method: 'get'
  })
}

// 删除会议
export function deleteMeeting(id) {
  return request({
    url: `/meeting/delete/${id}`,
    method: 'delete'
  })
} 