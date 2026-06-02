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
			<text class="fs-28">步</text>
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
					<view class="fs-28 color-181b19 fw">步數與運動</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				每日步行6000-10000步可促進血液循環，有助於維持正常血壓水平。規律運動(如快走、游泳等)每週>150分鐘，可降低高血壓風險。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">健康分析</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				每日步數少於4000步為低活動水平，可能表明久坐行為過多，建議增加日常活動。
				<br />
				每日步數在4000-8000步之間為中等活動水平，符合基本健康需求，但仍有提升空間。
				<br />
				每日步數在8000-12000步之間為活躍水平，有助於維持良好的心血管健康和體重管理。
				<br />
				每日步數超過12000步為高度活躍水平，表明您有很好的活動習慣，有利於整體健康。
				<br />
				心率位於最大心率的91%-100%為極限區間，在此區間心臟負擔很大，極易造成疲勞感，適用於有專業教練指導的短期訓練。研究表明，長期保持在最大心率的50%的顫率平均下"心跳區間"中最為科學和健康。
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
	currentDate.value = props.value.time || today;
	console.log("props.value", props.value);
});
onReady(() => {
	setNavigationBar("步数", "#f7f8fd");
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
				axisPointer: { type: "shadow" },
			},
			xAxis: {
				type: "category",
				data: watchDataList.value.xMap || [],
			},
			yAxis: {
				type: "value",
				name: props.value?.unit || "",
			},
			series: [
				{
					type: "line",
					data: watchDataList.value.yMap || [],
					barWidth: 20,
					itemStyle: {
						color: "#52AE7B",
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
	uni.showLoading({
		mask: true,
		title: "",
		icon: "none",
	});
	const params = {
		serialNumber: uni.getStorageSync("phone"),
		// deviceId: uni.getStorageSync("currentDeviceId"),
		type: "pedo",
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
