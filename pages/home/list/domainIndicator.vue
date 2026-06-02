<template>
	<view class="page">
		<scroll-view class="scroll-box" scroll-y="true">
			<view class="top-box">
				<view class="tabs-box">
					<view
						v-for="item in tabList"
						:key="item.id"
						class="tabs-box-item"
						:class="{
							active: currentIndex == item.id,
							first: item.isFirst,
							last: item.isLast,
						}"
						@click="changeTab(item.id)"
					>
						<view class="badge-box" style="width: 20px" v-if="Number(item.badge) > 0">
							{{ item.badge }}
						</view>
						<view class="tabs-item-text">{{ item.name }}</view>
					</view>
				</view>

				<view class="person-pic-box">
					<image class="img-box" :src="tabList[currentIndex - 1].url" mode="aspectFill"></image>
					<view class="scan-line" v-if="showMoveLine" :style="{ top: moveLine + 'rpx' }">
						<image src="/static/images/moveLine.png" mode="scaleToFill" class="img-box" />
					</view>
				</view>
			</view>
			<view class="content-box">
				<view class="switch-box">
					<view class="switch-card" @click="currentSwitch = 0" :class="{ active: currentSwitch == 0 }">
						健康检测
					</view>
					<view class="switch-card" @click="currentSwitch = 1" :class="{ active: currentSwitch == 1 }">
						健康解读
					</view>
				</view>
				<view class="content-card" v-show="currentSwitch == 0">
					<view class="echarts-box">
						<view class="">指标记录</view>
						<view class="swiper-count">
							<view class="">{{ echartsData[currentSwiper]?.metricName?.key }}</view>
							<view class="">{{ currentSwiper + 1 }}/{{ echartsData.length }}</view>
						</view>
						<swiper
							:indicator-dots="false"
							class="echarts-card"
							circular
							:current="currentSwiper"
							@change="swiperChange"
						>
							<swiper-item v-for="(item, index) in echartsData">
								<myEcharts :data="item" :active="currentSwiper === index" />
							</swiper-item>
						</swiper>
						<view class="echarts-color-list">
							<view
								class="echarts-color"
								v-for="i in currentSwiper >= 38 ? 3 : 4"
								:key="i"
								:style="{
									backgroundColor:
										colorMap[echartsData[currentSwiper]?.ranges?.items?.[i - 1]?.item] || '#F0B246',
								}"
							>
								{{ echartsData[currentSwiper]?.ranges?.items?.[i - 1]?.item || "" }}
							</view>
						</view>
						<view class="page-switch">
							<view @click="handleClickPrev">上一页</view>
							<view @click="handleClickNext">下一页</view>
						</view>
						<view class="desc-box">
							<view class="">
								<view class="">指標名稱</view>
								<view class="">{{ echartsData[currentSwiper]?.metricName.key }}</view>
							</view>
							<view class="">
								<view class="">檢測結果</view>
								<view
									class=""
									:style="{
										color: colorMap[echartsData[currentSwiper]?.summary.resultText],
									}"
								>
									{{ echartsData[currentSwiper]?.metricVal.val || 16.255 }}
								</view>
							</view>
							<view class="">
								<view class="">診斷意見</view>
								<view
									class=""
									:style="{
										color: colorMap[echartsData[currentSwiper]?.summary.resultText],
									}"
								>
									{{ echartsData[currentSwiper]?.summary.resultText }}
								</view>
							</view>
							<view class="">
								<view class="">參考範圍</view>
								<view class="">
									{{ echartsData[currentSwiper]?.summary.rangeDist }}
								</view>
							</view>
							<view class="">
								{{ echartsData[currentSwiper]?.summary.description }}
							</view>
						</view>
					</view>

					<view class="watch-box">
						<view class="">健康數據</view>
						<view class="watch-card-list">
							<view
								class="watch-card"
								v-for="(item, index) in watchList"
								:key="item.type"
								:style="{
									backgroundImage: `url(/static/watch/${item.type}.png)`,
								}"
								@click="clickWatch(item)"
							>
								<view class="watch-title">{{ item.title }}</view>
								<view class="watch-value">{{ item.value || "--" }}</view>
								<view class="watch-time">{{ item.time || "--" }}</view>
							</view>
						</view>
					</view>
					<view class="files-box">
						<view class="">健康檔案</view>
						<view class="files-list">
							<view
								class="files-card"
								v-for="(item, index) in archiveList"
								:key="index"
								@click="clickArchiveList(item)"
							>
								<view class="files-card-name">{{ item.name }}</view>
								<uni-icons type="right" size="20" color="#a2a2a2"></uni-icons>
							</view>
						</view>
					</view>
				</view>
				<view class="decode-box" v-show="currentSwitch == 1">
					<view class="history-box" @click="historyDecode">
						<view class="">
							<view class="">上次解读时间:</view>
							<view class="">{{ historyTime || "--" }}</view>
						</view>
						<view class="">
							<view class="">历史解读</view>
							<view class="">
								<uni-icons type="right" size="18" color="#a2a2a2"></uni-icons>
							</view>
						</view>
					</view>
					<view class="decode-card">
						<view class="decode-card-title">
							<view class="">指标解读</view>
							<view class="" @click="nowDecode" :style="{ opacity: loading || isStreaming ? 0.5 : 1 }">
								立即解读
							</view>
						</view>
						<view class="">
							<view class="" v-if="loading && !streamingContent">正在解读，请稍等...</view>
							<view
								class=""
								v-else
								v-html="renderedContent"
								ref="markdownRef"
								style="font-size: 24rpx"
							></view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed } from "vue";
import { onShow, onLoad, onHide } from "@dcloudio/uni-app";
import myEcharts from "./components/echarts.vue";
import dayjs from "dayjs";
import { marked } from "marked";
import {
	getPersonal,
	getEchartsDataNew,
	getWatchDataApi,
	getWatchList,
	getHistoryIll,
	getInterpretationTime,
	getInterpretation,
} from "@/api/base.js";
import { t } from "../../../uni_modules/uview-plus";

const tabList = ref([
	{
		id: 1,
		name: "全身",
		isFirst: true,
		isLast: false,
		badge: 0,
		url: "http://www.ruoguzhichuang.com/images/indicator/bodyAll.png",
	},
	{
		id: 2,
		name: "腦神經",
		isFirst: false,
		isLast: false,
		badge: 0,
		url: "http://www.ruoguzhichuang.com/images/indicator/item1.png",
	},
	{
		id: 3,
		name: "心腦血管",
		isFirst: false,
		isLast: false,
		badge: 0,
		url: "http://www.ruoguzhichuang.com/images/indicator/item2.png",
	},
	{
		id: 4,
		name: "肝功能",
		isFirst: false,
		isLast: false,
		badge: 0,
		url: "http://www.ruoguzhichuang.com/images/indicator/item3.png",
	},
	{
		id: 5,
		name: "腸胃功能",
		isFirst: false,
		isLast: false,
		badge: 0,
		url: "http://www.ruoguzhichuang.com/images/indicator/item4.png",
	},
	{
		id: 6,
		name: "膽功能",
		isFirst: false,
		isLast: false,
		badge: 0,
		url: "http://www.ruoguzhichuang.com/images/indicator/item5.png",
	},

	{
		id: 7,
		name: "腎功能",
		isFirst: false,
		isLast: false,
		badge: 0,
		url: "http://www.ruoguzhichuang.com/images/indicator/item7.png",
	},
	{
		id: 8,
		name: "肺功能",
		isFirst: false,
		isLast: true,
		badge: 0,
		url: "http://www.ruoguzhichuang.com/images/indicator/item6.png",
	},
]);

// 获取人体画像数据
const getPersonalData = async () => {
	try {
		const params = { serialNumber: uni.getStorageSync("phone") };
		const res = await getPersonal(params);

		// 正确获取数组
		const personalData = res.data?.data || [];

		// 设置全身总 badge
		const totalBadge = personalData.reduce((sum, cur) => sum + Number(cur.badge || 0), 0);
		tabList.value[0].badge = totalBadge;
		isRequest.value = totalBadge === 0;

		if (personalData.length > 0) {
			requestData.finggerSourceId = personalData[0].finggerId;
		}

		// 映射简体到繁体
		const nameMap = {
			脑神经: "腦神經",
			心脑血管: "心腦血管",
			肠胃功能: "腸胃功能",
			胆功能: "膽功能",
			肾功能: "腎功能",
			肺功能: "肺功能",
			肝功能: "肝功能",
		};

		// 遍历更新 tabList（只改 badge, detail, time，不改 name/url）
		personalData.forEach((data) => {
			const tab = tabList.value.find((item) => item.name == nameMap[data.name]);
			if (tab) {
				tab.badge = data.badge;
				tab.detail = data.detail;
				tab.remoteId = data.id;
				tab.time = formdateTime(data.createTime);
			}
		});
	} catch (error) {
		console.log("🚀 ~ getPersonalData ~ error:", error);
	}
};

const isRequest = ref(true);
// 构建后端需要的数据
const requestData = reactive({
	abnormalItems: [],
	badgeAllNumber: 0,
	finggerSourceId: "",
	serialNumber: uni.getStorageSync("phone"),
});

const currentIndex = ref(1);
const changeTab = (index) => {
	currentIndex.value = index;
};

// 上一页
const handleClickPrev = () => {
	currentSwiper.value = (currentSwiper.value - 1 + echartsData.value.length) % echartsData.value.length;
};
// 下一页
const handleClickNext = () => {
	currentSwiper.value = (currentSwiper.value + 1) % echartsData.value.length;
};

// 动态扫描效果
const moveLine = ref(0);
let direction = 1; // 控制上下移动方向
let timer = null;
let speed = 30;
const showMoveLine = ref(false);
const moveLineFn = () => {
	// 线条每次移动 10rpx
	moveLine.value += speed * direction;
	// 到达边界时，改变方向
	if (moveLine.value >= 916) direction = -1;
	if (moveLine.value <= 0) direction = 1;
};

// switch
const currentSwitch = ref(0);

// ECHARTS
const currentSwiper = ref(0);
const swiperChange = (e) => {
	currentSwiper.value = e.detail.current;
};
const echartsData = ref([]);
const colorMap = {
	"正常(阴)": "#52AE7B",
	"轻度(阳)": "#F0B246",
	"中度(阳++)": "#EA422A",
	"重度(阳+++)": "#BD1800",
	偏低: "#6F66EC",
	正常: "#52AE7B",
	偏高: "#BD1800",
};

// 获取echarts仪表盘数据
const getEcharts = async () => {
	// return;
	const params = {
		serialNumber: uni.getStorageSync("phone"),
		// startTime: startTime.value,
		// endTime: endTime.value,
	};
	try {
		const res = await getEchartsDataNew(params);
		// return;
		// res.data.data.forEach((item) => {
		// 	item.cvdTimeList = item.cvdTimeList.map((dateStr) => dayjs(dateStr, "YYYYMMDD").format("DD日"));
		// });
		echartsData.value = res.data.data;
		// isShowEcharts.value = res.data?.data?.length == 0 ? false : true;
	} catch (error) {
		console.log(error);
	} finally {
	}
};

const isWatch = ref(true);

// 获取设备列表
const getDeviceList = async () => {
	try {
		const params = {
			serialNumber: uni.getStorageSync("phone"),
		};
		const res = await getWatchList(params);
		if (res.code == 200) {
			if (res.data.length > 0) {
				// 遍历设备列表 判断出是否存在 设备名称为 '智能手环'的设备 并存储对应的
				res.data.forEach((item) => {
					if (item.deviceName == "智能手环") {
						isWatch.value = true;
					}
				});
			}
		}
	} catch (error) {
		//TODO handle the exception
		console.log(error);
	} finally {
	}
};

const watchList = ref([]);
const watchListMapUrl = {
	breath: {
		path: "/pages/home/watch/breath",
		title: "呼吸",
	},
	boxy: {
		path: "/pages/home/watch/watchBoxy",
		title: "血氧",
	},
	bp: {
		path: "/pages/home/watch/watchBp",
		title: "血压",
	},
	calorie: {
		path: "/pages/home/watch/watchCalorie",
		title: "热量",
	},
	hr: {
		path: "/pages/home/watch/watchHr",
		title: "心率",
	},
	hrv: {
		path: "/pages/home/watch/watchHrv",
		title: "压力",
	},
	sleep: {
		path: "/pages/home/watch/watchSleep",
		title: "睡眠",
	},
	step: {
		path: "/pages/home/watch/watchStep",
		title: "步数",
	},
	tmpr: {
		path: "/pages/home/watch/watchTmpr",
		title: "温度",
	},
};
const clickWatch = (v) => {
	console.log(v);
	uni.navigateTo({
		url: watchListMapUrl[v.type].path + `?data=${JSON.stringify(v)}`,
	});
};
// 获取手表数据
const getWatchData = async () => {
	try {
		const params = {
			serialNumber: uni.getStorageSync("phone"),
		};
		const res = await getWatchDataApi(params);
		if (res.code == 200) {
			const data = res.data;

			watchList.value = Object.keys(data).map((key) => {
				const item = data[key];
				return {
					type: key,
					title: item[key], // 中文名称
					value: item.value,
					time: item.time,
					minValue: item.minValue,
					maxValue: item.maxValue,
				};
			});
		}
	} catch (error) {
		console.log("getWatchDataApi  error", error);
	}
};

const formdateTime = (val) => {
	if (val) {
		return dayjs(val).format("YYYY-MM-DD");
	}
};
// 健康档案列表
const archiveList = ref([]);

const clickArchiveList = (val) => {
	uni.navigateTo({
		url: `/pages/home/list/archiveList?data=${JSON.stringify(val)}`,
		
	});
};

const handleGetInfo = async () => {
	try {
		const res = await getHistoryIll({ serialNumber: uni.getStorageSync("phone") });
		if (res.code == 200) {
			archiveList.value = res.data.data;
			console.log(res);
		}
	} catch (error) {
		console.log("🚀 ~ handleGetUserInfo ~ error:", error);
	} finally {
	}
};

//==================健康解读=====================
watch(
	() => currentSwitch.value,
	(val) => {
		if (val) {
			getHistoryTime();
		}
	},
);

const historyTime = ref("");
// 获取历史解读时间
const getHistoryTime = async () => {
	try {
		const params = { serialNumber: uni.getStorageSync("phone") };
		const res = await getInterpretationTime(params);
		historyTime.value = res.data.createTime;
	} catch (error) {
		//TODO handle the exception
		console.log("获取历史解读error", error);
	} finally {
	}
};
const historyDecode = () => {
	if (historyTime.value) {
		uni.navigateTo({
			url: "/pages/home/list/reportList",
			complete: (res) => {
				console.log(res);
			},
		});
	}
};
// 立即解读
const fullAIContent = ref("");

const streamingContent = ref("");
const isStreaming = ref(false);
const streamTimer = ref(null);
const streamIndex = ref(0);

const loading = ref(false);

const nowDecode = () => {
	if (isStreaming.value || loading.value) return;
	streaming();
};
const buildDataMethods = () => {
	requestData.abnormalItems = [];

	tabList.value.forEach((item, index) => {
		if (index == 0) {
			requestData.badgeAllNumber = item.badge;
			return;
		}

		if (item.detail?.length > 0) {
			requestData.abnormalItems.push({
				name: item.name,
				detail: item.detail,
			});
		}
	});
};
// 开始流式输出
const streaming = async () => {
	try {
		if (isStreaming.value) return;
		if (isRequest.value) return;
		isStreaming.value = true;
		loading.value = true;

		buildDataMethods();
		const res = await getInterpretation(requestData);
		console.log(res);
		fullAIContent.value = res.data;
		startStreaming();
	} catch (error) {
		isStreaming.value = false;
		console.log("解讀失败 error", error);
	} finally {
		loading.value = false;
	}
};
const startStreaming = () => {
	streamingContent.value = "";
	streamIndex.value = 0;

	const run = () => {
		if (streamIndex.value < fullAIContent.value.length) {
			streamingContent.value += fullAIContent.value[streamIndex.value];
			streamIndex.value++;

			streamTimer.value = setTimeout(run, 50);
		} else {
			stopStreaming();
		}
	};

	run();
};
// 计算属性：把流式内容解析成 HTML
const renderedContent = computed(() => marked(streamingContent.value || ""));
// 停止流式输出
const stopStreaming = () => {
	if (streamTimer.value) {
		clearInterval(streamTimer.value);
		streamTimer.value = null;
	}
	isStreaming.value = false;
};
onShow(() => {
	showMoveLine.value = true;
	timer = setInterval(moveLineFn, 100);
	setTimeout(() => {
		clearInterval(timer);
		showMoveLine.value = false;
	}, 6000);
	getPersonalData();
	getEcharts();
	getDeviceList();
	getWatchData();
	handleGetInfo();
});
onHide(() => {
	clearInterval(timer);
	showMoveLine.value = false;
	stopStreaming();
});
</script>

<style scoped lang="scss">
.scroll-box {
	width: 100%;
	height: 100%;
}
.top-box {
	width: 100%;
	height: 1024rpx;
	background: $bg-page;
}
.tabs-box {
	width: 200rpx;
	height: auto;
	background: rgba(#fff, 0.35);
	border-radius: 0 20rpx 20rpx 0;
	position: absolute;
	top: 180rpx;
	left: 0;
	box-sizing: border-box;
	border: 1px solid #fff;
}
.tabs-box-item {
	width: 100%;
	height: 80rpx;
	position: relative;
}
.active {
	background: rgba($primary, 1);
	color: $bg-card;
}
.first {
	border-top-right-radius: 20rpx;
}

.last {
	border-bottom-right-radius: 20rpx;
}
.badge-box {
	width: 32rpx;
	height: 24rpx;
	position: absolute;
	top: 8rpx;
	right: 12rpx;
	background: $danger;
	border-radius: 12rpx;
	color: #fff;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 16rpx;
}
.tabs-item-text {
	height: 100%;
	box-sizing: border-box;
	padding: 0 0 0 48rpx;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	font-size: 28rpx;
}
.person-pic-box {
	width: 550rpx;
	height: 950rpx;
	position: absolute;
	right: 0;
	top: 0;
}
.scan-line {
	position: absolute;
	left: 10%;
	// transform: translateX(-50%);
	width: 384rpx;
	height: 34rpx;
	transition: top 0.03s linear;
	z-index: 9;
}
.content-box {
	width: 100%;
	// height: 100%;
	background: linear-gradient(to bottom, #fff, #f8f8f8);
	border-radius: 40rpx 40rpx 0 0;
	margin-top: -40rpx;
	padding: 32rpx 48rpx;
}
.switch-box {
	@include flex-between;
}
.switch-card {
	width: 375rpx;
	height: 96rpx;
	position: relative;
	background-color: $bg-card;
	@include flex-center;
	font-size: 28rpx;
	color: $text-secondary;
}

.switch-card.active {
	color: $text-primary;
	font-weight: 700;
}

.switch-card.active::after {
	content: "";
	position: absolute;
	bottom: 8rpx; // 控制离底部距离
	left: 50%;
	transform: translateX(-50%);
	width: 112rpx; // 滑块宽度
	height: 4rpx; // 滑块高度
	background: linear-gradient(to right, $primary, $primary-light);
	border-radius: 6rpx;
}
.echarts-box,
.files-box,
.watch-box {
	width: 100%;
	// height: 892rpx;
	// background: linear-gradient(to bottom, $warning 0%, #fff 20%, #fff 100%);
	background-color: #fff;
	// background: linear-gradient(to bottom, rgba($warning, 0.5), #fff);
	border-radius: 40rpx;
	box-shadow: $box-shadow;
	border: 1px solid #fff;
	margin-top: 24rpx;
	padding: 24rpx;
}
.swiper-count {
	margin-top: 24rpx;
	@include flex-between;
	> :nth-child(1) {
		color: $text-regular;
		font-size: 28rpx;
	}
	> :nth-child(2) {
		@include flex-center;
		width: 80rpx;
		height: 32rpx;
		color: $primary-light;
		font-size: 20rpx;
		border-radius: 16rpx;
		background-color: rgba($primary-light, 0.2);
	}
}
.echarts-card {
	width: 100%;
	height: 400rpx;
	// background-color: #fff;
}
.echarts-color-list {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(60rpx, 1fr));
	gap: 12rpx;
	.echarts-color {
		height: 60rpx;
		border-radius: 8rpx;
		@include flex-center;
		color: #fff;
		font-size: 24rpx;
	}
}
.page-switch {
	margin-top: 24rpx;
	height: 80rpx;
	@include flex-between;
	> view {
		width: 50%;
		height: 100%;
		@include flex-center;
		font-size: 24rpx;
		color: $text-regular;
	}
}
.desc-box {
	width: 100%;
	background: rgba($primary-light, 0.07);
	border-radius: 40rpx;
	padding: 24rpx;
	color: $text-primary;
	font-size: 24rpx;
	> view:not(:last-child) {
		// height: 50rpx;
		gap: 16rpx;
		@include flex-start;
		> :nth-child(1) {
			// margin-right: 16rpx;
			font-weight: $font-weight-700;
			flex-shrink: 0;
		}
		> :nth-child(2) {
			flex: 1;
			word-break: break-all;
		}
	}
}
.watch-card-list {
	margin-top: 24rpx;
	display: grid;
	gap: 20rpx;
	grid-template-columns: repeat(2, 1fr);
	.watch-card {
		width: 291rpx;
		height: 160rpx;
		// background-color: $border-color;
		border-radius: 20rpx;
		padding: 16rpx;
		background-repeat: no-repeat;
		background-size: 100% 100%;
		box-shadow: $box-shadow;
		.watch-title {
			color: $text-primary;
			font-size: 28rpx;
		}
		.watch-value {
			color: $text-secondary;
			font-size: 24rpx;
			margin-top: 8rpx;
		}
		.watch-time {
			color: $text-secondary;
			font-size: 24rpx;
			margin-top: 24rpx;
		}
	}
}
.files-list {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24rpx;
	margin-top: 28rpx;
	.files-card {
		width: 291rpx;
		height: 162rpx;
		border-radius: 20rpx;
		background-color: rgba($primary-light, 0.07);
		padding: 16rpx;
		@include flex-between;
		box-shadow: $box-shadow;
		align-items: flex-start;
		.files-card-name {
			color: $text-primary;
			font-size: 26rpx;
		}
	}
}

.decode-box {
	background: rgba(#fff, 1);
}
.history-box {
	@include flex-between;
	background-color: #fff;
	box-shadow: $box-shadow;
	height: 80rpx;
	border-radius: 20rpx;
	padding: 0 24rpx;
	margin-top: 32rpx;
	> view {
		@include flex-start;
		gap: 12rpx;
		> :nth-child(1) {
			color: $text-regular;
			font-size: 24rpx;
			line-height: 1;
		}
		> :nth-child(2) {
			font-size: 26rpx;
			color: $text-primary;
			line-height: 1;
		}
	}
}
.decode-card {
	background-color: #fff;
	border-radius: 20rpx;
	box-shadow: $box-shadow;
	padding: 24rpx;
	margin-top: 24rpx;
	.decode-card-title {
		@include flex-between;
		> :nth-child(1) {
			color: $text-primary;
			font-size: 28rpx;
		}
		> :nth-child(2) {
			color: $primary;
			font-size: 24rpx;
		}
	}
}
</style>
