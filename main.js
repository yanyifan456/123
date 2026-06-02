import {
	createSSRApp
} from 'vue'
import App from './App.vue'
import i18n from './locale'
import uviewPlus from '@/uni_modules/uview-plus'
import subtitleStore from '@/store/subtitle.js'

// 将字幕全局状态挂载到 uni 上，方便任意页面读取
// 例：uni.$subtitle.currentText / uni.$subtitle.active
uni.$subtitle = subtitleStore

// 创建应用
export function createApp() {
	const app = createSSRApp(App)
	app.use(i18n)
	app.use(uviewPlus) // 注册 uViewPlus
	return {
		app
	}
}
