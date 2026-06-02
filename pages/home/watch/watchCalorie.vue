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
			<text class="fs-80">{{ total }}</text>
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
					<view class="fs-28 color-181b19 fw">熱量與飲食</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				合理控制每日熱量攝入(成人建議1800-2400千卡/天)，減少高鹽、高脂飲食，增加蔬果和全穀物攝入，可輔助體重管理(BMI建議18.5-23.9
				kg/m)，從而降低血壓異常風險。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">健康分析</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				熱量消耗在50%以下為休息區間，這區間通常出現在靜. 息或輕微活動時，如睡眠或坐姿工作。
				熱量消耗在50%-70%為輕度活動區間，常見於日常生活活動，如走路、輕度家務或低強度鍛鍊。
				熱量消耗在70%-85%為中度活動區間，通常在較快步行、慢跑等較費力的活動中達到，有利於提高有氧健康水平。
				熱量消耗在85%-100%為高強度活動區間，出現在劇烈運動如快跑、高強度間歇訓練時，能有效提升心肺功能但不宜長時間維持。
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
	// setNavigationBar("熱量", "#f7f8fd");
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
		type: "calorie",
		dataDate: currentDate.value,
	};
	try {
		const res = await getWatchDataByType(params);
		watchDataList.value = res.data.watchDataList;
		total.value = res.data.watchDataList.total || 0;
		isShowEcharts.value = watchDataList.value.xMap.length > 0;
		console.log("watchDataList", watchDataList.value);
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
