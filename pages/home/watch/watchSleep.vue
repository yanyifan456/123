<template>
	<view class="box">
		<!-- 日期选择 -->
		<view class="mb-32 date-box">
			<view class="icon-box-32" @click="onLeftArrow">
				<image src="/static/watch/leftArrow.png" mode="scaleToFill" class="img-box" />
			</view>
			<view @click="open">{{ currentDate }}</view>
			<view class="icon-box-32" @click="onRightArrow">
				<image src="/static/watch/rightArrow.png" mode="scaleToFill" class="img-box" />
			</view>
		</view>

		<!-- 总分显示 -->
		<view class="total-box">
			<text>{{ toHours(total) }}</text>
			<text>小時</text>
		</view>

		<!-- ECharts 图表 -->
		<view v-if="isShowEcharts">
			<l-echart ref="myChart" style="width: 100%; height: 450rpx"></l-echart>
		</view>
		<view v-else class="no_data">
			<view class="no_data-card" style="margin-top: 32rpx auto">
				<view class="icon-box-160">
					<image src="/static/images/no_msg.png" mode="scaleToFill" class="img-box" />
				</view>
				<view>當日暫無數據</view>
			</view>
		</view>

		<!-- 睡眠分析说明 -->
		<view class="sleep-list" style="width: 100%">
			<view v-for="(item, index) in sleepDataList" :key="index" class="sleep-item mb-20">
				<up-cell :border="false">
					<template #title>
						<view class="sleep-cate">
							<view
								:style="{
									background: item.color,
									width: '16rpx',
									height: '32rpx',
								}"
								class="mr-16"
							></view>
							<view class="fs-28 color-181b19 flex-row-c" style="height: 32rpx">
								{{ item?.name }}
							</view>
						</view>
					</template>
				</up-cell>
				<up-cell :border="false" isLink center class="mt-24">
					<template #title>
						<view class="fs-28 color-181b19">{{ item.value }}</view>
					</template>
					<template #value>
						<view class="color-868686 fs-24">參考值：{{ item.val }}</view>
					</template>
				</up-cell>
			</view>
		</view>
	</view>

	<!-- 日期选择器 -->
	<up-calendar
		:show="show"
		:mode="mode"
		color="#4063f4"
		showLunar
		@confirm="confirm"
		minDate="2025-01-01"
		:maxDate="today"
		:defaultDate="currentDate"
		monthNum="24"
		round="20"
		allowSameDay
		closeOnClickOverlay
		@close="close"
	></up-calendar>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import { getWatchDataByType } from "@/api/base.js";
import { onLoad, onReady } from "@dcloudio/uni-app";
import dayjs from "dayjs";

const props = ref();
onLoad(({ data }) => {
	props.value = JSON.parse(data || "{}");
	currentDate.value = props.value.time || today;
});

// onReady(() => {
//   setNavigationBar("睡眠", "#f7f8fd");
// });

const myChart = ref(null);
const isShowEcharts = ref(true);
const total = ref(0); // 睡眠评分
const currentDate = ref("");
const show = ref(false);
const mode = ref("single");
const today = dayjs().format("YYYY-MM-DD");

const open = () => {
	show.value = true;
};
const close = () => {
	show.value = false;
};
const confirm = (val) => {
	currentDate.value = val[0];
	getData();
	close();
};

const onLeftArrow = () => {
	currentDate.value = dayjs(currentDate.value).subtract(1, "day").format("YYYY-MM-DD");
	getData();
};

const onRightArrow = () => {
	if (dayjs(currentDate.value).isAfter(today)) return;
	currentDate.value = dayjs(currentDate.value).add(1, "day").format("YYYY-MM-DD");
	getData();
};

const watchDataList = ref({});
const sleepDataList = ref([
	{ color: "#459767", name: "夜间睡眠", value: "0分钟", val: "6~10h" },
	{ color: "#6F66EC", name: "深睡眠", value: "0分钟", val: "10~40%" },
	{ color: "#EC66C8", name: "浅睡眠", value: "0分钟", val: "45~80%" },
	{ color: "#EA422A", name: "快速眼动", value: "0分钟", val: "15~25%" },
	{ color: "#EAB02A", name: "清醒", value: "0分钟", val: "0~10%" },
]);
// 工具函数：将“x小时y分钟”或“y分钟”转换为小时数
const toHours = (val) => {
	if (!val) return 0;
	const hourMatch = val.match(/(\d+)小时/);
	const minuteMatch = val.match(/(\d+)分钟/);
	const hours = hourMatch ? Number(hourMatch[1]) : 0;
	const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
	return hours + minutes / 60;
};

// 初始化图表
const initChart = () => {
	if (!myChart.value) return;
	const sleepMap = watchDataList.value.sleepDataList;
	if (!sleepMap) return;
	const categories = ["深睡", "浅睡", "清醒", "眼动"];
	const values = [
		toHours(sleepMap.deepSleep),
		toHours(sleepMap.lightSleep),
		toHours(sleepMap.weakSleep),
		toHours(sleepMap.eyemoveSleep),
	];

	const colors = ["#6F66EC", "#EC66C8", "#EAB02A", "#EA422A"];

	myChart.value.init(echarts, null, {}, (chart) => {
		chart.setOption({
			color: colors,
			tooltip: {
				trigger: "axis",
				axisPointer: { type: "shadow" },
				formatter: (params) => {
					const data = params[0];
					return `${data.name}：${data.value.toFixed(2)} 小时`;
				},
			},
			grid: {
				top: 20,
				bottom: 30,
				left: 40,
				right: 20,
			},
			xAxis: {
				type: "category",
				data: categories,
				axisTick: { alignWithLabel: true },
			},
			yAxis: { type: "value" },
			series: [
				{
					type: "bar",
					barWidth: 30,
					data: values.map((v, i) => ({
						value: v,
						itemStyle: { color: colors[i] },
					})),
				},
			],
		});
	});
};

// 获取数据
const getData = async () => {
	const params = {
		serialNumber: uni.getStorageSync("phone"),
		// deviceId: uni.getStorageSync("currentDeviceId"),
		type: "sleep",
		dataDate: currentDate.value,
	};

	try {
		const res = await getWatchDataByType(params);
		console.log(res);
		watchDataList.value = res.data.watchDataList || {};
		total.value = watchDataList.value.sleepDataList?.totalTime || 0;
		isShowEcharts.value = !!res.data.watchDataList?.sleepDataList?.totalTime;
		const data = watchDataList.value.sleepDataList || {};

		// 更新 sleepDataList
		sleepDataList.value = [
			{
				color: "#459767",
				name: "夜间睡眠",
				value: data.totalTime || "0分钟",
				val: "6~10h",
			},
			{
				color: "#6F66EC",
				name: "深睡眠",
				value: data.deepSleep || "0分钟",
				val: "10~40%",
			},
			{
				color: "#EC66C8",
				name: "浅睡眠",
				value: data.lightSleep || "0分钟",
				val: "45~80%",
			},
			{
				color: "#EA422A",
				name: "快速眼动",
				value: data.eyemoveSleep || "0分钟",
				val: "15~25%",
			},
			{
				color: "#EAB02A",
				name: "清醒",
				value: data.weakSleep || "0分钟",
				val: "0~10%",
			},
		];
		await nextTick();
		if (isShowEcharts.value) {
			initChart();
		}
	} catch (err) {
		console.error(err);
		isShowEcharts.value = false;
	} finally {
	}
};

onReady(async () => {
	await nextTick();
	getData();
});
</script>

<style scoped lang="scss">
::v-deep .u-cell__body {
	padding: 0 !important;
}
.box {
	width: 100vw;
	min-height: 100vh;
	box-sizing: border-box;
	padding: 32rpx 48rpx;
	background: #f7f8fd;
}
.date-box {
	display: flex;
	justify-content: space-between;
	align-items: center;
	.icon-box-32 {
		width: 32rpx;
		height: 32rpx;
	}
}
.total-box {
	> :nth-child(1) {
		color: $text-primary;
		font-size: 80rpx;
	}
	> :nth-child(2) {
		color: $text-primary;
		font-size: 28rpx;
	}
}
.icon-box-160 {
	width: 160rpx;
	height: 160rpx;
}
.no_data {
	@include flex-center;
}
.no_data-card {
	@include flex-col-start;
}
.sleep-list {
	margin-top: 32rpx;
	.sleep-cate {
		@include flex-start;
	}
}
.sleep-item {
	width: 100%;
	height: 164rpx;
	border-radius: 20rpx;
	background: #fff;
	box-shadow: 0rpx 6rpx 12rpx 0rpx rgba(0, 0, 0, 0.0314);
	box-sizing: border-box;
	padding: 24rpx;
	margin-bottom: 20rpx;
}
</style>
