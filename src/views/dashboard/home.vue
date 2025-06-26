<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>用户总数</span>
            </div>
          </template>
          <div class="card-body">
            <div class="number">{{ userCount }}</div>
            <div class="text">个用户</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>今日新增</span>
            </div>
          </template>
          <div class="card-body">
            <div class="number">{{ todayNewUsers }}</div>
            <div class="text">个用户</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>本周新增</span>
            </div>
          </template>
          <div class="card-body">
            <div class="number">{{ weekNewUsers }}</div>
            <div class="text">个用户</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>本月新增</span>
            </div>
          </template>
          <div class="card-body">
            <div class="number">{{ monthNewUsers }}</div>
            <div class="text">个用户</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="userGrowthOption" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>用户分布</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="userDistributionOption" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

// 注册 ECharts 必须的组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const userCount = ref(0)
const todayNewUsers = ref(0)
const weekNewUsers = ref(0)
const monthNewUsers = ref(0)

// 用户增长趋势图表配置
const userGrowthOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line',
      smooth: true
    }
  ]
})

// 用户分布图表配置
const userDistributionOption = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '用户分布',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '企业用户' },
        { value: 735, name: '个人用户' },
        { value: 580, name: '管理员' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

// 获取统计数据
const fetchStatistics = () => {
  // TODO: 调用获取统计数据的 API
  userCount.value = 2363
  todayNewUsers.value = 128
  weekNewUsers.value = 735
  monthNewUsers.value = 1892
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  text-align: center;
  padding: 20px 0;
}

.number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}

.text {
  font-size: 14px;
  color: #666;
}

.chart-container {
  height: 300px;
}

.chart {
  height: 100%;
}

.mt-4 {
  margin-top: 1rem;
}
</style> 