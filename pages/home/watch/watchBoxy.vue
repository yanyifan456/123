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
					<image src="/static/images/no_msg.png" mode="scaleToFill" class="img-box" />
				</view>
				<view>當日暫無數據</view>
			</view>
		</view>
		<view class="mt-32">
			<up-cell :border="false">
				<template #title>
					<view class="fs-28 color-181b19 fw">血氧飽和度</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				血氧飽和度是血液中被氧結合的氧合血紅蛋白的容量佔全部可結合的血紅蛋白容量的百分比，即血液中血氧的濃度，它是呼吸循環的重要生理參數。
				理想情況下，血氧飽和度應為95%-100%；但受個人身體狀態、海拔、某些疾病等影響會有不同。
			</view>
			<up-cell :border="false" class="mt-28">
				<template #title>
					<view class="fs-28 color-181b19 fw">過低血氧</view>
				</template>
			</up-cell>
			<view class="fs-24 color-434343 mt-28">
				當一段時間內檢測到您的血氧飽和度低於設定的提醒值，會提醒您留意當前健康狀況並記錄該段數據。
				如果您同時出現呼吸急促、頭疼疲乏、注意力降低等情況，建議尋求專業的醫務人員幫助。
				特別提示，可穿戴設備獲取的血氧數據值僅供參考，如有任何不適，請務必前往醫院諮詢專業的醫療人士。
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
	props.value = JSON.parse(data || "{}");
	currentDate.value = dayjs(props.value.time).format("YYYY-MM-DD") || today;
	console.log("props.value", props.value);
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
				name: "血氧(%)",
				min: () => {
					const minVal = Math.min(...watchDataList.value.yAvgMap.map(Number));
					return Math.max(0, Math.floor(minVal * 0.95));
				},
				max: 100,
				axisLabel: {
					formatter: "{value}%", // ✅ 显示为百分号
				},
			},
			series: [
				{
					type: "bar",
					data: watchDataList.value.yAvgMap.map(Number),
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
	const params = {
		serialNumber: uni.getStorageSync("phone"),
		// deviceId: uni.getStorageSync("currentDeviceId"),
		type: "boxy",
		dataDate: currentDate.value,
	};
	console.log(params);
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
		console.log(error);
	} finally {
	}
};
onReady(() => {
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
</style>
