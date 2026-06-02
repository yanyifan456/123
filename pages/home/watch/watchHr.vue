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
			<text class="fs-80">{{ avg }}</text>
			<text class="fs-28">bpm</text>
		</view>
		<view class="mt-32 flex-row-fs-c mb-20">
			<view class="mr-60">
				<view class="color-181b19">
					<text class="fs-28">{{ max }}</text>
					<text class="fs-24">bpm</text>
				</view>
				<view class="color-868686 fs-24">最大心率</view>
			</view>
			<view class="mr-60">
				<view class="color-181b19">
					<text class="fs-28">{{ min }}</text>
					<text class="fs-24">bpm</text>
				</view>
				<view class="color-868686 fs-24">最小心率</view>
			</view>
			<view class="mr-60">
				<view class="color-181b19">
					<text class="fs-28">{{ avg }}</text>
					<text class="fs-24">bpm</text>
				</view>
				<view class="color-868686 fs-24">平均心率</view>
			</view>
		</view>
		<view v-if="isShowEcharts">
			<l-echart ref="myChart" style="width: 100%; height: 450rpx"></l-echart>
		</view>
		<view v-else class="flex-row-c">
			<view class="fs-28 color-181b19 fw" style="margin-top: 32rpx auto">
				<view class="icon-box-160">
					<image src="/static/images1/healthReport/noData.png" mode="scaleToFill" class="img-box" />
				</view>
				<view>當日暫無數據</view>
			</view>
		</view>
		<view class="mt-32">
			<up-cell :border="false">
				<template #title>
					<view class="fs-28 color-181b19 fw">健康分析</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				心率是指心臟每分鐘跳動的次數，成年人安靜狀態下的心率一般為55~80次每分鐘，其通常會因年齡、性別或其他生理因素產生個體差異。運動時心跳會加速，心肺功能較好的運動員心率通常比普通成年人的心跳要慢。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">健康分析</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				各個心率區間的時間長度，來自日常心率數據的分布： ·
				心率值為最大心率的50%-60%為熱身區間，該區間適用於跑步前的動態熱身，跑步後的放鬆活動。
				心率值為最大心率的61%-70%為燃脂區間，在此區間身體主要通過燃燒脂肪的方式為運動供能，能有效減少脂肪或控制體脂率。
				· 心率值為最大心率的71%-80%為有氧區間，在此區間碳水化合物為主要的供能物質，能有效鍛鍊心肺功能。 ·
				心率值為最大心率的81%-90%為無氧區間，在此區間乳酸堆積量增加，用於訓練身體提高乳酸耐受性。
				心率值為最大心率的91%-100%為極限區間，在此區間心臟負擔很大，鍛鍊絕對速度能力，適用於有豐富經驗的訓練者。
				另，低於最大心率的50%的數據不在“心率區間”中統計和展示。
			</view>
		</view>
	</view>
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
	// setNavigationBar("心率", "#f7f8fd");
});
const myChart = ref(null);
const isShowEcharts = ref(true);
const initChart = () => {
	myChart.value.init(echarts, null, {}, (chart) => {
		chart.setOption({
			tooltip: {
				trigger: "axis",
				axisPointer: {
					type: "cross",
					label: { backgroundColor: "#6a7985" },
				},
			},
			// legend: {
			//   data: ["最小心率", "平均心率", "最大心率"],
			//   top: 10,
			// },
			grid: {
				top: 20,
				bottom: 30,
				left: 40,
				right: 20,
			},
			xAxis: {
				type: "category",
				// boundaryGap: false,
				data: watchDataList.value.xMap || [],
			},
			yAxis: {
				type: "value",
				name: "心率(bpm)",
				min: (value) => Math.floor(Math.min(...watchDataList.value.yMinMap.map(Number)) * 0.9),
				max: (value) => Math.ceil(Math.max(...watchDataList.value.yMaxMap.map(Number)) * 1.1),
			},
			series: [
				{
					name: "最小心率",
					type: "line",
					data: watchDataList.value.yMinMap.map(Number),
					smooth: true,
					lineStyle: { color: "#14a0fb" },
					itemStyle: { color: "#14a0fb" },
				},
				{
					name: "平均心率",
					type: "line",
					data: watchDataList.value.yAvgMap.map(Number),
					smooth: true,
					lineStyle: { color: "#459767" },
					itemStyle: { color: "#459767" },
				},
				{
					name: "最大心率",
					type: "line",
					data: watchDataList.value.yMaxMap.map(Number),
					smooth: true,
					lineStyle: { color: "#ea422a" },
					itemStyle: { color: "#ea422a" },
				},
			],
		});
	});
};

const onLeftArrow = () => {
	// 以目前數據日期為準，取值上一天
	currentDate.value = dayjs(currentDate.value).subtract(1, "day").format("YYYY-MM-DD");
	getData();
};
const onRightArrow = () => {
	// 以目前數據日期為準，取值下一天 不能超過今天
	if (dayjs(currentDate.value).isAfter(today)) {
		return;
	}
	currentDate.value = dayjs(currentDate.value).add(1, "day").format("YYYY-MM-DD");
	getData();
};
const total = ref(0);
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
// 平均心率
const avg = ref(0);
// 最大心率
const max = ref(0);
// 最小心率
const min = ref(0);

const getData = async () => {
	uni.showLoading({
		mask: true,
		title: "",
		icon: "none",
	});
	const params = {
		serialNumber: uni.getStorageSync("phone"),
		// deviceId: uni.getStorageSync("currentDeviceId"),
		type: "hr",
		dataDate: currentDate.value,
	};
	try {
		const res = await getWatchDataByType(params);
		watchDataList.value = res.data.watchDataList;
		total.value = res.data.watchDataList.total || 0;
		isShowEcharts.value = watchDataList.value.xMap.length > 0;
		console.log("watchDataList", watchDataList.value);
		avg.value = res.data.watchDataList.yAvgMap[res.data.watchDataList.yAvgMap.length - 1] || 0;
		max.value = res.data.watchDataList.yMaxMap[res.data.watchDataList.yMaxMap.length - 1] || 0;
		min.value = res.data.watchDataList.yMinMap[res.data.watchDataList.yMinMap.length - 1] || 0;

		// 等待 DOM 更新完畢再初始化圖表
		await nextTick();
		if (isShowEcharts.value) {
			initChart();
		}
	} catch (error) {
	} finally {
		uni.hideLoading();
	}
};
onMounted(() => {
	getData();
	return;
	initChart();
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
	background: #f8f8f8;
}
.date-box {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>
