// src/api/news.js
import request from '@/utils/request'

// 获取资讯列表
export const fetchNewsList = (params) => {
  return request({
    url: '/news',
    method: 'get',
    params
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