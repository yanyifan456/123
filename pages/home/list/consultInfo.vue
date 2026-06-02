<template>
	<view class="page">
		<view class="content-box">
			<view class="top-box" @click="showDatePicker">
				<view class="">{{ currentDateStr || "選擇查詢日期" }}</view>
				<view class="">
					<uni-icons type="down" color="#434343" size="20"></uni-icons>
				</view>
			</view>
			<scroll-view
				scroll-y="true"
				class="scroll-box"
				lower-threshold="80"
				ref="scrollRef"
				@scrolltolower="handleLoadMore"
			>
			<view
					v-for="(item, index) in tabData"
					:key="index"
					class="card-info"
					@click="handleClickConsultDetail(item)"
				>
					<view class="order-info">
						<view class="">
							环球港医网-{{ item.userName }}{{ item.tradeStatus === '0' ? '建議單' : '處方單' }}
						</view>
						<view class="">日期：{{ item.createTime }}</view>
					</view>
					<view class="arrow-icon"><uni-icons type="right" color="#434343" size="20"></uni-icons></view>
				</view>
				<view class="loading-box" v-if="loading">
					<uni-icons type="spinner-cycle" color="#a2a2a2" size="30"></uni-icons>
				</view>
				<view class="loading-finish" v-if="!hasMore && tabData.length">我是有底线的</view>
				<view v-if="!loading && tabData.length === 0" class="empty-wrapper">
					<view class="empty-box">
						<view class="no_msg">
							<image src="/static/images/no_msg.png" mode="aspectFit" class="img-box" />
						</view>
						<view class="text">暫無數據</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
	<up-datetime-picker
		:show="show"
		v-model="currentDate"
		cancelColor="#a2a2a2"
		confirmColor="#434343"
		mode="date"
		:minDate="minDate"
		:maxDate="maxDate"
		:showToolbar="true"
		@confirm="dateConfirm"
		@cancel="dateCancel"
		@close="dateClose"
		:closeOnClickOverlay="true"
	></up-datetime-picker>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { selectconsultationlist } from "@/api/base.js";
import { onShow, onLoad } from "@dcloudio/uni-app";
import dayjs from "dayjs";
// 控制选择器显示
const show = ref(false);

// 当前选中的日期时间戳
const currentDate = ref(dayjs().valueOf());
const currentDateStr = ref(dayjs().format("YYYY-MM-DD"));

// 计算前后两年的时间戳
const minDate = ref(dayjs().subtract(2, "year").valueOf());
const maxDate = ref(dayjs().add(2, "year").valueOf());

// 格式化函数
const formatDate = (timestamp) => dayjs(timestamp).format("YYYY-MM-DD");

// 显示选择器
const showDatePicker = () => {
	show.value = true;
};

// 取消/关闭回调
const dateCancel = () => dateClose();
const dateClose = () => {
	show.value = false;
};

// 确认回调
const dateConfirm = (res) => {
	currentDate.value = res.value;
	currentDateStr.value = formatDate(res.value);
	show.value = false;
	getList(true);
};

const handleClickConsultDetail = (item) => {
	if (item.tradeStatus === '0') {
		uni.navigateTo({
			url: `/pages/home/list/consultDetail?id=${item.consultationId}`,
		});
	} else {
		uni.navigateTo({
			url: `/pages/home/list/consultDetaissl?id=${item.consultationId}`,
		});
	}
};

// 触底加载
const handleLoadMore = () => {
	getList();
};

const pageSize = 10;

const tabData = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const total = ref(0);

const currentPage = ref(1);

// 排序函数：相同 consultationId 的数据，tradeStatus 为 0 的排前面
const sortByConsultationAndStatus = (list) => {
	// 按 consultationId 分组
	const groupedMap = new Map();
	list.forEach((item) => {
		const id = item.consultationId;
		if (!groupedMap.has(id)) {
			groupedMap.set(id, []);
		}
		groupedMap.get(id).push(item);
	});

	// 每组内按 tradeStatus 排序（0 在前，大于 0 的按升序排列）
	const sortedList = [];
	groupedMap.forEach((group) => {
		group.sort((a, b) => {
			const statusA = Number(a.tradeStatus) || 0;
			const statusB = Number(b.tradeStatus) || 0;
			return statusA - statusB;
		});
		sortedList.push(...group);
	});

	return sortedList;
};

// 核心请求方法
const getList = async (reset = false) => {
	try {
		if (loading.value) return;

		// 👉 如果是重新查询（切换日期）
		if (reset) {
			currentPage.value = 1;
			tabData.value = [];
			hasMore.value = true;
		}

		if (!hasMore.value) return;

		loading.value = true;

		const params = {
			userId: uni.getStorageSync("userId"),
			createTime: currentDateStr.value,
			currentPage: currentPage.value.toString(),
			pageSize: pageSize.toString(),
		};

		const res = await selectconsultationlist(params);
		console.log(res);
		const list = res.data.data || [];
		const totalCount = res.data.total || 0;

		// ✅ 对返回数据进行排序
		const sortedList = sortByConsultationAndStatus(list);

		// ✅ 关键：数据累加
		if (currentPage.value === 1) {
			tabData.value = sortedList;
		} else {
			// 累加后重新排序整体数据
			tabData.value = sortByConsultationAndStatus([...tabData.value, ...sortedList]);
		}

		total.value = totalCount;

		// ✅ 判断是否还有更多
		if (tabData.value.length >= totalCount || list.length < pageSize) {
			hasMore.value = false;
		} else {
			currentPage.value++;
		}
	} catch (err) {
		console.log(err);
	} finally {
		loading.value = false;
	}
};

onShow(() => {
	getList();
});
</script>
<style scoped lang="scss">
.content-box {
	height: 100vh;
	display: flex;
	flex-direction: column;
}
.scroll-box {
	padding: 32rpx 48rpx;
	box-sizing: border-box;
	flex: 1;
	overflow: hidden;
}
.top-box {
	@include flex-between;
	width: 100%;
	height: 80rpx;
	padding: 0 $space-48;
	background-color: $bg-card;
	> :nth-child(1) {
		color: $text-primary;
		font-size: 28rpx;
	}
}
.card-info {
	width: 100%;
	// height: 240rpx;
	background-color: #fff;
	box-shadow: $box-shadow;
	border-radius: $space-20;
	padding: $space-32;
	margin-bottom: $space-24;
	position: relative;
	@include flex-between;
	.order-info {
		> :nth-child(1) {
			color: $text-primary;
			font-size: 28rpx;
		}
		> :nth-child(2) {
			color: $text-secondary;
			margin-top: 8rpx;
			font-size: 20rpx;
		}
	}
	.arrow-icon {
		flex-shrink: 0;
	}
}

.loading-box {
	margin-top: $space-12;
	@include flex-center;
}
.loading-finish {
	width: 100%;
	height: 160rpx;
	padding: $space-20 $space-48;
	color: $text-secondary;
	@include flex-center;
}

.empty-wrapper {
	width: 100%;
	height: 100%;
	@include flex-center;
}
.empty-box {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.no_msg {
	width: 160rpx;
	height: 160rpx;
}
.text {
	margin-top: $space-20;
	color: $text-secondary;
}
</style>