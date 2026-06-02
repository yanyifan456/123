<template>
	<view class="page">
		<view class="content-box">
			<view class="grid-item" v-for="(item, index) in baseList" :key="item.id" @click="handleClick(item)">
				<view class="grid-item-icon">
					<image :src="item.icon" mode="aspectFill" class="img-box"></image>
				</view>
				<view class="grid-item-text">
					{{ item.title }}
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from "vue";

const baseList = ref([
	{
		id: 1,
		title: "預約看診",
		icon: "https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon1.png", // 这里可以是图标名称或路径
		path: "/pages/home/list/goDoctor",
	},
	{
		id: 2,
		title: "預約記錄",
		icon: "https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon2.png",
		path: "/pages/home/list/appointmentInfo?tabsCurrent=0",
	},
	{
		id: 3,
		title: "會診記錄",
		icon: "https://doctor.gzxinxingyiyuan.com/images/image/home/girdIcon4.png",
		path: "/pages/home/list/consultInfo",
	},
]);

const handleClick = ({ path }) => {
	const url = path;
	uni.navigateTo({
		url,
	});
};
</script>

<style scoped lang="scss">
.content-box {
	width: 100%;
	// height: 100%;
	padding: $space-32 $space-48;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24rpx;
}

.grid-item {
	width: 315rpx;
	height: 368rpx;
	background-color: #fff;
	box-shadow: $box-shadow;
	border-radius: $radius-20;
	@include flex-col-start;
}

.grid-item-icon {
	width: 160rpx;
	height: 160rpx;
	margin-top: $space-68;
}

.grid-item-text {
	color: $text-secondary;
	font-size: $font-28;
	margin-top: $space-28;
}
</style>
