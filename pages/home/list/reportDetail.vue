<template>
	<view class="page">
		<scroll-view scroll-y="true" class="scroll-box">
			<view>
				<view class="detail-time">{{ detail?.createTime }}</view>
				<view class="detail-title">异常指标</view>
				<view class="detail-card-box">
					<view class="detail-card" v-for="item in detail.abnormalItems">
						{{ item.name }}
					</view>
				</view>
				<view class="detail-title">健康解读</view>
				<view class="detail-desc" style="line-height: 1.5; font-size: 28rpx" v-html="html"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { onShow, onLoad } from "@dcloudio/uni-app";
import { ref, computed } from "vue";
import { getInterpretationDetail } from "@/api/base.js";
import { marked } from "marked";

const props = ref({});
onLoad((options) => {
	console.log(options);
	props.value = JSON.parse(options.data);
});
onShow(() => {
	getDetail();
});
marked.setOptions({
	gfm: true, // 启用 GitHub 风格的 Markdown
	breaks: true, // 支持换行符（回车就是换行）
	headerIds: true, // 自动生成 h1~h6 的 id
	headerPrefix: "", // id 前缀
	mangle: false, // 是否混淆自动生成的邮箱
	smartLists: true, // 优化列表
	smartypants: false, // 转换直引号和破折号
});
const detail = ref({});
const getDetail = async () => {
	try {
		const res = await getInterpretationDetail({ id: props.value.id });
		detail.value = res.data;
	} catch (error) {
		//TODO handle the exception
	}
};
const html = computed(() => marked(detail.value.explainResult || ""));
</script>

<style scoped lang="scss">
.scroll-box {
	box-sizing: border-box;
	padding: 32rpx 48rpx;
	width: 100%;
	height: 100%;
}
.detail-time {
	color: $text-secondary;
	font-size: 28rpx;
}
.detail-title {
	color: $text-primary;
	font-size: 32rpx;
	margin: 28rpx 0;
}
.detail-desc {
	padding: 32rpx;
	background-color: $bg-card;
	box-shadow: $box-shadow;
	border-radius: 20rpx;
}
.detail-card-box {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	padding: 32rpx;
	background-color: $bg-card;
	box-shadow: $box-shadow;
	border-radius: 20rpx;
}
.detail-card {
	background-color: rgba($danger, 0.2);
	color: $danger;
	font-size: 28rpx;
	border-radius: 32rpx;
	height: 64rpx;
	@include flex-center;
	padding: 16rpx;
	width: fit-content;
	white-space: nowrap;
}
</style>
