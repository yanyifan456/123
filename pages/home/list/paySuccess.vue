<template>
	<view class="page pages">
		<view class="btn" @click="goHome">完成</view>
	</view>
</template>

<script setup>
import { onBackPress } from "@dcloudio/uni-app";

onBackPress(() => {
	// 返回 true 表示：阻止返回
	return true;
});

const goHome = () => {
	uni.switchTab({
		url: "/pages/home/home",
	});
};
</script>

<style scoped lang="scss">
.pages {
	background: url("/static/images/paySuccess.png");
	background-repeat: no-repeat;
	background-size: 100% 100%;
	@include flex-center;
}
.btn {
	width: 204rpx;
	height: 80rpx;
	background: #52ae7b;
	border-radius: 16rpx 16rpx 16rpx 16rpx;
	@include flex-center;
	color: #fff;
	font-size: 28rpx;
}
</style>
