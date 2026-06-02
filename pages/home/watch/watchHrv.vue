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
		<view class="mt-32 p-24" style="box-sizing: border-box">
			<up-cell :border="false">
				<template #title>
					<view class="fs-28 color-181b19 fw">溫馨提示</view>
				</template>
			</up-cell>
			<!-- 上方文字标签 -->
			<view class="label-bar mt-20">
				<view v-for="(label, index) in labelList" :key="index" class="label-text" :style="getLabelStyle(index)">
					{{ label }}
				</view>
			</view>
			<!-- 上方色块区域 -->
			<view class="color-bar mt-28">
				<view
					v-for="(color, index) in colorList"
					:key="index"
					class="color-block"
					:style="{ backgroundColor: color }"
				></view>
			</view>

			<!-- 下方刻度区域 -->
			<view class="scale-box">
				<view
					v-for="(num, index) in rangeList"
					:key="index"
					class="scale-text"
					:style="{ left: `calc(${(index / (rangeList.length - 1)) * 100}%)` }"
				>
					{{ num }}
				</view>
			</view>
		</view>
		<view class="mt-32">
			<up-cell :border="false">
				<template #title>
					<view class="fs-28 color-181b19 fw">壓力</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				壓力是心理壓力源和心理壓力反應共同構成的一種認知和行為體驗過程。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">壓力產生</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				壓力的產生不僅僅是因為負面或者消極的事情，甚至一些積極正面的事情也會造成很大的壓力。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">緩解壓力建議</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				不要有太大的得失心。很多時候，我們越是在意一件事情，就越會產生害怕和擔心出錯的情緒，而這些情緒積累的多了，就會不斷對自己產生壓力。
				同樣，對自己有太高的目標，和強烈的得失心，也會讓我們陷入到巨大的壓力漩渦之中。
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
	// setNavigationBar("压力", "#f7f8fd");
});
const myChart = ref(null);
const isShowEcharts = ref(true);
const initChart = () => {
	myChart.value.init(echarts, null, {}, (chart) => {
		chart.setOption({
			grid: {
				top: 30,
				bottom: 30,
				left: 20,
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
				name: "压力",
				min: 0,
				max: 100, // ✅ 压力值最高100%
			},
			series: [
				{
					type: "bar",
					data: watchDataList.value.yMap.map((v) => Number(v)),
					barWidth: 20,
					itemStyle: {
						color: (params) => {
							const val = params.value;
							// ✅ 根据压力数值动态判断颜色
							if (val < 30) return "#6F66EC"; // 低压 紫
							if (val < 60) return "#52AE7B"; // 轻度 绿
							if (val < 80) return "#EAB02A"; // 中度 黄
							return "#EA422A"; // 高压 红
						},
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

const colorList = ref(["#6F66EC", "#52AE7B", "#EAB02A", "#EA422A"]);

const rangeList = ref(["0", "30", "60", "80", "100"]);
const labelList = ref(["放松", "正常", "尚可", "高"]);
const getLabelStyle = (index) => {
	return { color: colorList.value[index] };
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
		title: "",
		icon: "none",
		mask: true,
	});
	const params = {
		serialNumber: uni.getStorageSync("phone"),
		// deviceId: uni.getStorageSync("currentDeviceId"),
		type: "hrv",
		dataDate: currentDate.value,
	};
	try {
		const res = await getWatchDataByType(params);
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
		console.log(error);
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
	background: #f7f8fd;
}
.date-box {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.label-bar {
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	width: 100%;
}

.label-text {
	font-size: 24rpx;
	font-weight: 500;
	text-align: center;
	flex: 1;
}

.color-bar {
	position: relative;
	display: flex;
	width: 100%;
	height: 58rpx;
	border-radius: 8rpx;
	overflow: hidden;

	.color-block {
		flex: 1;
		height: 100%;
	}
}

.scale-box {
	position: relative;
	width: 100%;
	margin-top: 8rpx;
	height: 30rpx;

	.scale-text {
		position: absolute;
		transform: translateX(-50%);
		font-size: 24rpx;
		color: #181b19;
		text-align: center;
	}
}
</style>
