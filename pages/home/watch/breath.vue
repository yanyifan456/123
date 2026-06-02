<template>
	<view class="box">
		<view class="mb-32 date-box">
			<view class="icon-box-32" @click="onLeftArrow">
				<image src="/static/watch/leftArrow.png" mode="scaleToFill" class="img-box" />
			</view>
			<view @click="open">{{ currentDate }}</view>
			<view class="icon-box-32" @click="onRightArrow">
				<image src="/static/watch/rightArrow.png" mode="scaleToFill" class="img-box" />
			</view>
		</view>

		<view class="color-181b19">
			<text class="fs-80">{{ total }}</text>
			<text class="fs-28">千卡</text>
		</view>
		<view v-if="isShowEcharts">
			<l-echart ref="myChart" style="width: 100%; height: 450rpx"></l-echart>
		</view>
		<view v-else class="flex-row-c">
			<view class="fs-28 color-181b19 fw" style="margin-top: 32rpx auto">
				<view class="icon-box-160">
					<image src="/static/images1/healthReport/noData.png" mode="scaleToFill" class="img-box" />
				</view>
				<view>当日暂无数据</view>
			</view>
		</view>
		<view class="mt-32">
			<up-cell :border="false">
				<template #title>
					<view class="fs-28 color-181b19 fw">过高体温</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				发烧体温高于37.2℃，高热体温高于39℃。高热可能导致身体蛋白质变性，引起乏力、头晕、头痛等症状，严重者可能会出现呼吸衰竭、心力衰竭等危及生命的后果。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">过低体温</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				体温过低是指产热减少和散热增加导致体温低于正常范围，体温低于35℃时称体温不升。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">正常体温</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				正常体温不是一个具体的温度点，而是一个温度范围。机体深部的体温较为恒定和均匀，称深部体温；而体表的温度受多种因素影响，变化和差异较大，称表层温度。
				临床上所指的体温是指平均深部温度。一般以口腔、直肠和腋窝的体温为代表，其中直肠体温接近深部体温。
				正常值：口腔舌下温度为36.3~37.2℃，直肠温度36.5~37.7℃（比口腔温度高0.2~0.5℃），腋下温度36.0~37.0℃。
				正常体温的标准是根据多数人的数值，并非为个体的绝对数量。
			</view>
		</view>
	</view>
	<up-calendar
		:show="show"
		:mode="mode"
		color="#459767"
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
import { ref, onMounted, computed, nextTick } from "vue";
import * as echarts from "echarts";
import { getWatchDataByType } from "@/api/base.js";
import { onLoad, onReady } from "@dcloudio/uni-app";
import dayjs from "dayjs";

const props = ref();
onLoad(({ data }) => {
	props.value = JSON.parse(data);
	currentDate.value = dayjs(props.value.time).format("YYYY-MM-DD") || today;
	console.log("props.value", props.value);
});
onReady(() => {
	// setNavigationBar("呼吸", "#ffffff");
});
const myChart = ref(null);
const isShowEcharts = ref(false);
const initChart = () => {
	myChart.value.init(echarts, null, {}, (chart) => {
		chart.setOption({
			grid: {
				top: 30,
				bottom: 30,
				left: 40,
				right: 20,
			},
			tooltip: {
				trigger: "axis",
			},
			xAxis: {
				type: "category",
				data: watchDataList.value.xMap || [],
				axisLabel: {
					interval: Math.ceil(watchDataList.value.xMap.length / 5),
				},
			},

			dataZoom: [
				{
					type: "inside",
					start: 0,
					end: 40,
				},
			],

			yAxis: {
				type: "value",
				name: "呼吸次数",
				// 单位是摄氏度
				// min: 34,
				// max: 42,
				// axisLabel: {
				//   formatter: "{value}℃", // ✅ 在刻度后面显示 ℃
				// },
			},
			series: [
				{
					name: "呼吸次数",
					type: "line",
					data: watchDataList.value.yMap.map(Number),
					smooth: true,
					lineStyle: { color: "#459767" },
					itemStyle: { color: "#459767" },
				},
			],
		});
	});
};

const onLeftArrow = () => {
	// 以目前数据日期为准，取值上一天
	currentDate.value = dayjs(currentDate.value).subtract(1, "day").format("YYYY-MM-DD");
	getData();
};
const onRightArrow = () => {
	// 以目前数据日期为准，取值下一天 不能超过今天
	if (dayjs(currentDate.value).isAfter(today)) {
		return;
	}
	currentDate.value = dayjs(currentDate.value).add(1, "day").format("YYYY-MM-DD");
	getData();
};
const avgBreath = ref(0);
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
	console.log("🚀 ~ val:", val);
	currentDate.value = val[0];
	getData();
	close();
};

const watchDataList = ref({});
const getData = async () => {
	// showLoading();
	uni.showLoading({
		title: "",
		mask: true,
		icon: "none",
	});
	const params = {
		serialNumber: uni.getStorageSync("phone"),
		// deviceId: uni.getStorageSync("currentDeviceId"),
		type: "breath",
		dataDate: currentDate.value,
	};
	try {
		const res = await getWatchDataByType(params);
		console.log(res);
		watchDataList.value = res.data.watchDataList;
		avgBreath.value = res.data.watchDataList.avgBreath || 0;
		isShowEcharts.value = watchDataList.value.xMap.length > 0;
		console.log("watchDataList", watchDataList.value);
		// 等待 DOM 更新完毕再初始化图表
		await nextTick();
		if (isShowEcharts.value) {
			initChart();
		}
	} catch (error) {
		console.log(error);
	} finally {
		uni.hideLoading();
	}
};
onMounted(async () => {
	getData();
	// return;
	// await nextTick()
	// initChart();
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
	background-color: $bg-page;
}
.date-box {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>
