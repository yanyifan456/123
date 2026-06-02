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
		<!-- 
    <view class="color-181b19">
      <text class="fs-80"> {{ total }}</text>
      <text class="fs-28">mmHg</text>
    </view>
    <view class="mt-32 flex-row-fs-c mb-20">
      <view class="mr-60">
        <view class="color-181b19">
          <text class="fs-28">{{ max }}</text>
          <text class="fs-24">mmHg</text>
        </view>
        <view class="color-868686 fs-24">舒张压</view>
      </view>
      <view class="mr-60">
        <view class="color-181b19">
          <text class="fs-28">{{ min }}</text>
          <text class="fs-24">mmHg</text>
        </view>
        <view class="color-868686 fs-24">收缩压</view>
      </view>
    </view> -->
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
					<view class="fs-28 color-181b19 fw">血壓</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				血壓是血液循環對身體動脈壁的壓力。 由兩個數值組 成， 收縮壓顯示心臟收縮或跳動時的血管壓力， 俗稱高
				壓；舒張壓顯示心臟在兩次跳動之間舒張時的血管壓 力， 俗稱低壓。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">高血壓</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				根據《中國高血壓防治指南》（2018修訂版）中高血壓 的診斷標準關於診室血壓： 在未服用降壓藥的情況下,
				非同日3次測量高壓（收縮壓）≥140mmHg和低壓（舒 張壓）≥90mmHg，可診斷為高血壓。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">高壓水平分類</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				{{
					"目前正在服用 降壓藥物，血壓雖<140/90mmHg，仍診斷為高血壓 血壓水平分類 目前我國採用正常血壓、正常高值和高血壓進行血壓水 平分類。 該分類適用於18歲以上任何年齡的成年人。 正常血壓： 高壓（收縮壓）<120mmHg和低壓（舒張 壓）<80mmHg。 正常高值：高壓（收縮壓）120~139mmHg和（或）低 壓（舒張壓）80~89mmHg。 高血壓：高壓（收縮壓）≥140mmHg和（或）低壓（舒 張壓）≥90mmHg。 以上高血壓定義和血壓水平分類來源於《中國高血壓防 治指南 （2018年修訂版） 》 低血壓尚無明確定義。一般認為成年人高壓 （收縮壓） ≤90mmHg，低壓（舒張壓）≤60mmHg即為血壓偏 低。 以上內容僅供參考， 不能作為診斷或治療依據。"
				}}
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
	// setNavigationBar("血壓", "#f7f8fd");
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
			grid: {
				top: 20,
				bottom: 30,
				left: 40,
				right: 20,
			},
			xAxis: {
				type: "category",
				data: watchDataList.value.xMap || [],
			},
			yAxis: {
				type: "value",
				name: "血壓(mmHg)",
				min: (value) => Math.floor(Math.min(...watchDataList.value.yDbpMap.map(Number)) * 0.9),
				max: (value) => Math.ceil(Math.max(...watchDataList.value.ySbpMap.map(Number)) * 1.1),
			},
			series: [
				{
					name: "舒張壓",
					type: "line",
					data: watchDataList.value.yDbpMap.map(Number),
					smooth: true,
					lineStyle: { color: "#459767" },
					itemStyle: { color: "#459767" },
				},
				{
					name: "收縮壓",
					type: "line",
					data: watchDataList.value.ySbpMap.map(Number),
					smooth: true,
					lineStyle: { color: "#ea422a" },
					itemStyle: { color: "#ea422a" },
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
		type: "bp",
		dataDate: currentDate.value,
	};
	try {
		const res = await getWatchDataByType(params);
		watchDataList.value = res.data.watchDataList;
		total.value = res.data.watchDataList.total || 0;
		isShowEcharts.value = watchDataList.value.xMap.length > 0;
		console.log("watchDataList", watchDataList.value);
		max.value = res.data.watchDataList.yDbpMap[res.data.watchDataList.yDbpMap.length - 1] || 0;
		min.value = res.data.watchDataList.ySbpMap[res.data.watchDataList.ySbpMap.length - 1] || 0;

		// 等待 DOM 更新完毕再初始化图表
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
