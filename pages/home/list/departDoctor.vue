<template>
	<view class="page">
		<scroll-view
			scroll-y="true"
			class="scroll-box"
			lower-threshold="80"
			@scrolltolower="handleLoadMore"
			v-if="list.length != 0"
		>
			<view class="doctor-card" v-for="item in list" :key="item.doctorId" @click="handleClickDetail(item)">
				<view style="overflow: hidden">
					<image :src="item.doctorPhoto" mode="" class="img-box"></image>
				</view>
				<view>
					<view>
						<view>{{ item.doctorName }}</view>
						<view>{{ item.profession }}</view>
					</view>
					<view>{{ item.departName }}</view>
					<view>{{ item.proSkill }}</view>
					<view>
						<view>
							<text style="font-size: 20rpx">￥</text>
							<text>{{ item.mainlandFee }}</text>
						</view>
						<view>预约费</view>
					</view>
				</view>
			</view>
			<!-- loading -->
			<view class="loading-box" v-if="loading">
				<uni-icons color="#a2a2a2" type="spinner-cycle" size="30"></uni-icons>
			</view>

			<!-- 已到底 -->
			<view class="loading-finish" v-if="finished">我是有底线的</view>
		</scroll-view>
		<view v-if="list.length == 0" class="empty-wrapper">
			<view class="empty-box">
				<view class="no_msg">
					<image src="/static/images/no_msg.png" mode="aspectFit" class="img-box" />
				</view>
				<view class="text">暫無數據</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getDoctorByDepart } from "@/api/base.js";

const title = ref("");
const id = ref("");
onLoad(({ departId, departName }) => {
	title.value = departName;
	id.value = departId;
	getList();
});

onShow(() => {
	uni.setNavigationBarTitle({
		title: title.value,
	});
});

const list = ref([]);

// 懒加载及其分页
const pageNum = ref(1);
const pageSize = 10;
const loading = ref(false);
const finished = ref(false);
const countUnreadMsg = ref(0);

const getList = async () => {
	if (loading.value || finished.value) return;

	loading.value = true;

	try {
		const res = await getDoctorByDepart({
			depart: id.value,
			current: pageNum.value,
			pageSize,
		});
		const { data, total } = res.data;

		// countUnreadMsg.value = res.data.countUnreadMsg;

		// 分页追加
		list.value = [...list.value, ...data];

		// 判断是否到底
		if (list.value.length >= total) {
			finished.value = true;
		} else {
			pageNum.value++;
		}
	} catch (error) {
		console.log("医生列表接口error", error);
	} finally {
		loading.value = false;
	}
};

// 触底
const handleLoadMore = () => {
	getList();
};

const handleClickDetail = (item) => {
	uni.navigateTo({
		url: `/pages/home/list/doctorDetail?data=${JSON.stringify(item)}`,
	});
};
</script>

<style scoped lang="scss">
.scroll-box {
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	padding: 0 $space-48;
}
.doctor-card {
	width: 100%;
	height: 248rpx;
	border-radius: $radius-20;
	background-color: #fff;
	box-shadow: $box-shadow;
	margin-top: $space-20;
	padding: $space-32;
	@include flex-start;
	> :nth-child(1) {
		width: 184rpx;
		height: 184rpx;
		border-radius: $radius-20;
		margin-right: $space-32;
		position: relative;
		> :nth-child(2) {
			width: 50rpx;
			height: 56rpx;
			position: absolute;
			top: 0;
			left: 22rpx;
		}
	}
	> :nth-child(2) {
		flex: 1;
		position: relative;
		> :nth-child(1) {
			@include flex-start;
			> :nth-child(1) {
				color: $text-primary;
				font-size: $font-32;
				margin-right: $space-24;
			}
			> :nth-child(2) {
				color: $text-regular;
				font-size: $font-24;
			}
		}

		> :nth-child(2) {
			margin-top: $space-20;
			color: $text-secondary;
			font-size: $font-24;
		}

		> :nth-child(3) {
			width: fit-content;
			margin-top: $space-20;
			color: $primary;
			font-size: $font-24;
			padding: $space-8 $space-16;
			border: 1px solid $primary;
			border-radius: $radius-20;
		}

		> :nth-child(4) {
			@include flex-start-baseline;
			position: absolute;
			bottom: 0;
			right: 0;
			color: $primary;
			font-size: $font-24;
			> :nth-child(1) {
				margin-right: $space-8;
				font-size: $font-28;
				color: $danger;
			}

			> :nth-child(2) {
				font-size: $font-20;
				color: $text-regular;
			}
		}
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
