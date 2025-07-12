// src/api/news.js
import request from '@/utils/request'

// 获取资讯列表，支持userId参数
export const fetchNewsList = (params) => {
  return request({
    url: '/news',
    method: 'get',
    params
  })
}

// 获取待审核动态（管理员专用）
export const fetchPendingNewsList = () => {
  return request({
    url: '/news/pending',
    method: 'get'
  })
}

// 添加资讯
export const addNewsItem = (data) => {
  return request({
    url: '/news',
    method: 'post',
    data
  })
}

// 编辑资讯
export const editNewsItem = (id, data) => {
  return request({
    url: `/news/${id}`,
    method: 'put',
    data
  })
}

// 删除资讯
export const deleteNewsItem = (id) => {
  return request({
    url: `/news/${id}`,
    method: 'delete'
  })
}

// 获取新闻详情
export const getNewsDetail = (id) => {
  return request({
    url: `/news/${id}`,
    method: 'get'
  })
}

// 导出新闻数据
export const exportNews = () => {
  return request({
    url: '/news/export',
    method: 'get',
    responseType: 'blob'
  })
}

// 审核新闻
export const auditNewsItem = (id, status) => {
  return request({
    url: `/news/audit/${id}`,
    method: 'put',
    params: { status }
  })
}

// 上传新闻图片
export const uploadNewsImage = (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return request({
    url: `/news/${id}/image`,
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 获取新闻图片（返回blob）
export const getNewsImageUrl = (id) => {
  return `/api/news/${id}/image`;
}