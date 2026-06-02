<template>
	<scroll-view class="scroll-box" scroll-y :style="{ height: scrollHeight + 'px' }">
		<image class="long-image" src="/static/img/11.png" mode="widthFix" />
	</scroll-view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { setNavigationBar } from "@/utils/navigation.js";
import { onShow } from "@dcloudio/uni-app";

const scrollHeight = ref(0);

onShow(() => {
	setNavigationBar("用户協議", "#fafbff");
});

// 获取屏幕高度，设置 scroll-view 高度
onMounted(() => {
	uni.getSystemInfo({
		success: (res) => {
			scrollHeight.value = res.windowHeight;
		},
	});
});
</script>

<style scoped lang="scss">
.scroll-box {
	width: 100vw;
	box-sizing: border-box;
	padding: 32rpx 48rpx;
	background: #fafbff;
}

.long-image {
	width: 100%;
}
</style>
