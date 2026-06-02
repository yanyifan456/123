<template>
	<view class="date-picker-mask" v-if="visible" @click="close">
		<view class="date-picker-content" @click.stop>
			<!-- 頭部 -->
			<view class="date-picker-header">
				<text class="date-picker-title">時間篩選</text>
				<view class="close-btn" @click="close">
					<text class="close-icon">×</text>
				</view>
			</view>
			
			<!-- 日期切換按鈕 -->
			<view class="date-tabs">
				<view 
					:class="['date-tab', activeTab === 'start' ? 'active' : '']"
					@click="activeTab = 'start'"
				>
					{{ startDate }}
				</view>
				<view 
					:class="['date-tab', activeTab === 'end' ? 'active' : '']"
					@click="activeTab = 'end'"
				>
					{{ endDate }}
				</view>
			</view>
			
			<!-- 滾動選擇器 -->
			<view class="picker-wrapper">
				<picker-view 
					class="picker-view" 
					:value="pickerValue" 
					@change="onPickerChange"
					indicator-style="height: 88rpx;"
				>
					<!-- 年份列 -->
					<picker-view-column>
						<view 
							class="picker-item" 
							v-for="year in yearList" 
							:key="year"
						>
							{{ year }}年
						</view>
					</picker-view-column>
					
					<!-- 月份列 -->
					<picker-view-column>
						<view 
							class="picker-item" 
							v-for="month in monthList" 
							:key="month"
						>
							{{ month }}月
						</view>
					</picker-view-column>
					
					<!-- 日期列 -->
					<picker-view-column>
						<view 
							class="picker-item" 
							v-for="day in dayList" 
							:key="day"
						>
							{{ day }}日
						</view>
					</picker-view-column>
				</picker-view>
			</view>
			
			<!-- 底部按鈕 -->
			<view class="date-picker-footer">
				<view class="btn-reset" @click="reset">重置</view>
				<view class="btn-confirm" @click="confirm">確定</view>
			</view>
			
			<!-- 底部安全區域指示條 -->
			<view class="safe-area-indicator"></view>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed, watch } from "vue"
	
	const props = defineProps({
		visible: {
			type: Boolean,
			default: false
		},
		defaultStartDate: {
			type: String,
			default: ''
		},
		defaultEndDate: {
			type: String,
			default: ''
		}
	})
	
	const emit = defineEmits(['update:visible', 'confirm', 'close'])
	
	// 當前激活的tab
	const activeTab = ref('start')
	
	// 格式化日期
	const formatDate = (date) => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}
	
	// 初始化日期
	const today = new Date()
	const startDate = ref(props.defaultStartDate || formatDate(today))
	const endDate = ref(props.defaultEndDate || formatDate(today))
	
	// 年份列表 (2024-2028)
	const yearList = ref([])
	for (let i = 2024; i <= 2028; i++) {
		yearList.value.push(i)
	}
	
	// 月份列表
	const monthList = ref([])
	for (let i = 1; i <= 12; i++) {
		monthList.value.push(i)
	}
	
	// 日期列表
	const dayList = ref([])
	for (let i = 1; i <= 31; i++) {
		dayList.value.push(i)
	}
	
	// 選擇器當前值
	const pickerValue = ref([0, 0, 0])
	
	// 解析日期字符串
	const parseDate = (dateStr) => {
		const parts = dateStr.split('-')
		return {
			year: parseInt(parts[0]),
			month: parseInt(parts[1]),
			day: parseInt(parts[2])
		}
	}
	
	// 根據當前選中的日期更新picker值
	const updatePickerValue = () => {
		const currentDate = activeTab.value === 'start' ? startDate.value : endDate.value
		const { year, month, day } = parseDate(currentDate)
		
		const yearIndex = yearList.value.indexOf(year)
		const monthIndex = month - 1
		const dayIndex = day - 1
		
		pickerValue.value = [
			yearIndex >= 0 ? yearIndex : 0,
			monthIndex >= 0 ? monthIndex : 0,
			dayIndex >= 0 ? dayIndex : 0
		]
	}
	
	// 監聽activeTab變化
	watch(activeTab, () => {
		updatePickerValue()
	})
	
	// 監聽visible變化
	watch(() => props.visible, (val) => {
		if (val) {
			activeTab.value = 'start'
			updatePickerValue()
		}
	})
	
	// picker變化事件
	const onPickerChange = (e) => {
		const values = e.detail.value
		const year = yearList.value[values[0]]
		const month = String(monthList.value[values[1]]).padStart(2, '0')
		const day = String(dayList.value[values[2]]).padStart(2, '0')
		const newDate = `${year}-${month}-${day}`
		
		if (activeTab.value === 'start') {
			startDate.value = newDate
		} else {
			endDate.value = newDate
		}
		
		pickerValue.value = values
	}
	
	// 重置
	const reset = () => {
		const todayStr = formatDate(today)
		startDate.value = todayStr
		endDate.value = todayStr
		activeTab.value = 'start'
		updatePickerValue()
	}
	
	// 確定
	const confirm = () => {
		emit('confirm', {
			startDate: startDate.value,
			endDate: endDate.value
		})
		close()
	}
	
	// 關閉
	const close = () => {
		emit('update:visible', false)
		emit('close')
	}
	
	// 初始化
	updatePickerValue()
</script>

<style scoped lang="scss">
	.date-picker-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		align-items: flex-end;
	}
	
	.date-picker-content {
		width: 100%;
		background-color: #ffffff;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
	}
	
	.date-picker-header {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 36rpx 32rpx;
		position: relative;
	}
	
	.date-picker-title {
		font-size: 32rpx;
		color: #333333;
		font-weight: 500;
	}
	
	.close-btn {
		position: absolute;
		right: 32rpx;
		top: 50%;
		transform: translateY(-50%);
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.close-icon {
		font-size: 40rpx;
		color: #999999;
		line-height: 1;
	}
	
	.date-tabs {
		display: flex;
		padding: 0 32rpx;
		gap: 24rpx;
		margin-bottom: 32rpx;
	}
	
	.date-tab {
		flex: 1;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 40rpx;
		font-size: 28rpx;
		color: #333333;
		background-color: #f5f5f5;
		border: 2rpx solid transparent;
	}
	
	.date-tab.active {
		background-color: rgba(82, 174, 123, 0.1);
		border-color: #52AE7B;
		color: #52AE7B;
	}
	
	.picker-wrapper {
		height: 440rpx;
		padding: 0 32rpx;
	}
	
	.picker-view {
		width: 100%;
		height: 100%;
	}
	
	.picker-item {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		color: #cccccc;
		height: 88rpx;
		line-height: 88rpx;
	}
	
	/* 選中項的樣式通過indicator-class控制 */
	picker-view-column {
		.picker-item {
			color: #cccccc;
		}
	}
	
	.date-picker-footer {
		display: flex;
		padding: 32rpx;
		gap: 24rpx;
	}
	
	.btn-reset {
		flex: 1;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 44rpx;
		font-size: 30rpx;
		color: #333333;
		background-color: #ffffff;
		border: 2rpx solid #e5e5e5;
	}
	
	.btn-confirm {
		flex: 1.5;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 44rpx;
		font-size: 30rpx;
		color: #ffffff;
		background-color: #52AE7B;
	}
	
	.safe-area-indicator {
		width: 134rpx;
		height: 10rpx;
		background-color: #333333;
		border-radius: 5rpx;
		margin: 16rpx auto 20rpx;
	}
</style>
