<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h1>欢迎来到测盟汇管理系统</h1>
      <p>这是一个企业培训管理平台，为企业提供全方位的培训解决方案。</p>
    </div>

    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon color="#409eff"><User /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">1,234</div>
                <div class="stats-label">用户总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon color="#67c23a"><OfficeBuilding /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">56</div>
                <div class="stats-label">企业数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon color="#e6a23c"><Reading /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">789</div>
                <div class="stats-label">课程数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon color="#f56c6c"><Calendar /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">23</div>
                <div class="stats-label">本月会议</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>



    <div class="quick-actions">
      <el-card>
        <template #header>
          <span>快速操作</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-button type="primary" @click="$router.push('/profile')" icon="User">
              个人信息
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="success" @click="$router.push('/system/user')" icon="UserFilled">
              用户管理
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="warning" @click="$router.push('/system/enterprise')" icon="OfficeBuilding">
              企业管理
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  User, 
  OfficeBuilding, 
  Reading, 
  Calendar,
  UserFilled
} from '@element-plus/icons-vue'
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-section h1 {
  color: #303133;
  margin-bottom: 10px;
}

.welcome-section p {
  color: #606266;
  font-size: 16px;
}

.stats-section {
  margin-bottom: 30px;
}

.stats-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-content {
  display: flex;
  align-items: center;
}

.stats-icon {
  font-size: 48px;
  margin-right: 20px;
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stats-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.permission-test {
  margin-bottom: 30px;
}

.permission-info p {
  margin-bottom: 10px;
}

.role-tag, .permission-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

.permission-list {
  margin: 10px 0;
  padding-left: 20px;
}

.permission-list li {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.quick-actions {
  margin-bottom: 30px;
}

.quick-actions .el-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
}
</style> 