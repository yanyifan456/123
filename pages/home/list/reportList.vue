<template>
	<view class="page">
		<scroll-view scroll-y="true" class="scroll-box">
			<view v-for="(item, index) in list" :key="index">
				<view class="history-months">{{ item.months }}</view>
				<view class="history-card" v-for="detail in item.detail" @click="clickReportDetail(detail)">
					<view class="">{{ detail.name }}</view>
					<view class="">{{ detail.time }}</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref } from "vue";
import { getInterpretationList } from "@/api/base.js";
import { onShow } from "@dcloudio/uni-app";

const list = ref([]);
const getList = async () => {
	try {
		const params = { serialNumber: uni.getStorageSync("phone") };
		const res = await getInterpretationList(params);
		list.value = res.data;
	} catch (error) {
		//TODO handle the exception
	}
};

const clickReportDetail = (v) => {
	uni.navigateTo({
		url: `/pages/home/list/reportDetail?data=${JSON.stringify(v)}`,
	});
};
onShow(() => {
	getList();
});
</script>

<style scoped lang="scss">
.scroll-box {
	width: 100%;
	height: 100%;
	padding: 32rpx 48rpx;
	box-sizing: border-box;
}
.history-months {
	color: $text-primary;
	font-size: 24rpx;
	line-height: 1;
}
.history-card {
	@include flex-between;
	margin: 28rpx 0;
	height: 102rpx;
	background-color: $bg-card;
	border-radius: 20rpx;
	box-shadow: $box-shadow;
	padding: 32rpx;
	> :nth-child(1) {
		color: $text-regular;
		font-size: 28rpx;
	}
	> :nth-child(2) {
		color: $text-secondary;
		font-size: 24rpx;
	}
}
</style>
