import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import App from '@/App.vue'
import router from '@/router'
import {createPinia} from "pinia"
import {createPersistedState} from "pinia-persistedstate-plugin"
import zhCn from "element-plus/dist/locale/zh-cn.mjs"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const app = createApp(App)
const pinia = createPinia()
const persist = createPersistedState();
// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
pinia.use(persist)
app.use(pinia)
app.use(ElementPlus,{locale:zhCn})
app.use(router)
app.mount('#app') 