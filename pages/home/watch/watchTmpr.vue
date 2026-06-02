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

		<!-- <view class="color-181b19">
      <text class="fs-80"> {{ total }}</text>
      <text class="fs-28">千卡</text>
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
					<view class="fs-28 color-181b19 fw">過高體溫</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				發燒體溫高於37.2℃，高熱體溫高於39℃。高熱可能導致身體蛋白質變性，引起乏力、頭暈、頭痛等症狀，嚴重者可能會出現呼吸衰竭、心力衰竭等危及生命的後果。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">過低體溫</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				體溫過低是指產熱減少和散熱增加導致體溫低於正常範圍，體溫低於35℃時稱體溫不升。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">正常體溫</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				正常體溫不是一個具體的溫度點，而是一個溫度範圍。機體深部的體溫較為恆定和均勻，稱深部體溫；而體表的溫度受多種因素影響，變化和差異較大，稱表層溫度。
				臨床上所指的體溫是指平均深部溫度。一般以口腔、直腸和腋窩的體溫為代表，其中直腸體溫接近深部體溫。
				正常值：口腔舌下溫度為36.3~37.2℃，直腸溫度36.5~37.7℃（比口腔溫度高0.2~0.5℃），腋下溫度36.0~37.0℃。
				正常體溫的標準是根據多數人的數值，並非為個體的絕對數量。
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
	// setNavigationBar("体温", "#f7f8fd");
});
const myChart = ref(null);
const isShowEcharts = ref(true);
const initChart = () => {
	myChart.value.init(echarts, null, {}, (chart) => {
		chart.setOption({
			grid: {
				top: 20,
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
			},
			yAxis: {
				type: "value",
				// 单位是摄氏度
				min: 34,
				max: 42,
				axisLabel: {
					formatter: "{value}℃", // ✅ 在刻度后面显示 ℃
				},
			},
			series: [
				{
					type: "line", // 改为折线图
					data: watchDataList.value.yMap.map(Number),
					smooth: true, // 平滑折线
					symbol: "circle", // 数据点形状
					symbolSize: 6, // 数据点大小
					lineStyle: {
						color: "#52AE7B", // 折线颜色
						width: 2,
					},
					itemStyle: {
						color: "#52AE7B", // 数据点颜色
					},
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
const getData = async () => {
	// showLoading();
	uni.showLoading({
		mask: true,
		title: "",
		icon: "none",
	});
	const params = {
		serialNumber: uni.getStorageSync("phone"),
		// deviceId: uni.getStorageSync("currentDeviceId"),
		type: "tmpr",
		dataDate: currentDate.value,
	};
	try {
		const res = await getWatchDataByType(params);
		console.log(res);
		watchDataList.value = res.data.watchDataList;
		total.value = res.data.watchDataList.total || 0;
		isShowEcharts.value = watchDataList.value.xMap.length > 0;
		console.log("watchDataList", watchDataList.value);
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
