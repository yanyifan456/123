<template>
	<view class="page pages">
		<view class="content-box">
			<view v-for="(item, index) in props.list" :key="index" class="archive-box">
				<view class="archive-name">
					{{ item.name }}
				</view>
				<view class="archive-value">
					{{ item.value }}
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref } from "vue";
import { onShow, onLoad } from "@dcloudio/uni-app";
const props = reactive({});
onLoad((options) => {
	props.title = JSON.parse(options.data).name || "";
	props.list = JSON.parse(options.data).value || [];

	uni.setNavigationBarTitle({
		title: props.title,
	});
});
</script>

<style scoped lang="scss">
.pages {
	padding: 32rpx 48rpx;
}
.content-box {
	width: 100%;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24rpx;
}
.archive-box {
	width: 315rpx;
	height: 142rpx;
	background-color: #fff;
	border-radius: 20rpx;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 24rpx;
}
.archive-name {
	font-weight: bold;
	font-size: 28rpx;
	color: $text-primary;
}
.archive-value {
	font-weight: 400;
	font-size: 24rpx;
	color: $primary-light;
}
</style>
