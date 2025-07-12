import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

//导入 echarts 工具和echarts
import Echarts from 'vue-echarts'
import 'echarts'

import App from './App.vue'
import router from './router'

// 在开发环境导入调试工具
if (import.meta.env.DEV) {
  import('./utils/debug')
}

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
//全局组件
app.component("Echarts",Echarts) 
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
