import {
	createSSRApp
} from 'vue'
import App from './App.vue'
import i18n from './locale'
import uviewPlus from '@/uni_modules/uview-plus'

// 创建应用
export function createApp() {
	const app = createSSRApp(App)
	app.use(i18n)
	app.use(uviewPlus) // 注册 uViewPlus
	return {
		app
	}
}