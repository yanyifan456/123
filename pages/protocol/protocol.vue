<template>
	<scroll-view scroll-y class="page">
		<image :src="url" mode="widthFix" class="agreement-image" />
	</scroll-view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const url = ref("");

onLoad((options) => {
	if (options.url) {
		url.value = decodeURIComponent(options.url);
	}
});
</script>

<style scoped>
.page {
	width: 100%;
	height: 100vh;
	background: #f8f8f8;
	padding: 32rpx 48rpx;
	box-sizing: border-box;
}

.agreement-image {
	width: 100%;
	display: block;
}
</style>
