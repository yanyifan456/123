<template>
	<view class="box">
		<view class="audio-box">
			<image :src="props?.titlePic" class="img-box" mode="aspectFill"></image>
			<!-- <video
				v-if="props?.detailVideo"
				:src="props.detailVideo"
				controls
				class="video-box"
			></video> -->
		</view>

		<view class="content-text">
			<!-- 保留你之前的 u-cell 深度样式需要的结构 -->
			<up-cell :border="false">
				<template #title>
					<view class="fs-24 color-979698">發布時間：{{ props?.time || "2025-09-09 12:00" }}</view>
				</template>
			</up-cell>

			<!-- 标题 -->
			<view class="title fs-32 color-373738 box-mt-16">
				{{ props?.title || "就醫難！看病難！你還在為無法就醫而煩惱嗎？" }}
			</view>

			<!-- 正文（按段落渲染） -->
			<view class="article fs-28 color-373738 box-mt-24">
				<view v-for="(p, index) in contentList" :key="index" class="paragraph">
					{{ p }}
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { onShow, onLoad } from "@dcloudio/uni-app";
import { setNavigationBar } from "@/utils/navigation";
import { ref } from "vue";

onShow(() => {
	setNavigationBar("資訊詳情", "#ffffff");
});

const props = ref({});

// 默认内容（可由上页传入 props.content，用换行分段）
const contentList = ref([]);

onLoad(({ data }) => {
	if (data) {
		props.value = JSON.parse(data);
		if (props.value.desc) {
			// 假设传入字符串，用换行分段
			contentList.value = props.value.desc.split(/\r?\n+/).filter(Boolean);
		}
	}
});
</script>

<style scoped lang="scss">
/* 恢复你之前的深度样式（例：uview 的 u-cell body） */
::v-deep .u-cell__body {
	padding: 0 !important;
}

/* 页面基础 */
.box {
	width: 100vw;
	min-height: 100vh;
	background: $bg-page;
	box-sizing: border-box;
}

/* 封面图 */
.audio-box {
	width: 100%;
	height: 452rpx;
	.img-box {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

/* 内容卡片（白底圆角，与封面衔接） */
.content-text {
	width: 100%;
	padding: 32rpx 48rpx;
	box-sizing: border-box;
	background: #fff;
	border-radius: 20rpx 20rpx 0 0;
	margin-top: -20rpx; /* 与封面衔接的视觉效果 */
}

/* 时间（保持你原来的样式） */
.fs-24.color-979698 {
	font-size: 24rpx;
	color: #979698;
}

/* 标题 */
.title {
	font-weight: 700;
	line-height: 44rpx;
}

/* 文章主体：段落样式 + 首行缩进 + 行高 */
.article {
	margin-top: 24rpx;

	.paragraph {
		margin-bottom: 32rpx;
		/* 首行缩进（文章缩进） */
		text-indent: 48rpx;

		/* 行高和对齐 */
		line-height: 44rpx;
		/* 根据中文排版习惯，left 或 justify 都可，保持左对齐更稳妥 */
		text-align: left;

		/* 防止英文或超长单词撑破布局 */
		word-break: break-word;
		overflow-wrap: break-word;
	}
}

/* 保证在不同字体大小下段落间距与行高协调 */
.fs-28 {
	font-size: 28rpx;
}
.color-373738 {
	color: #373738;
}
.box-mt-16 {
	margin-top: 16rpx;
}
.box-mt-24 {
	margin-top: 24rpx;
}
</style>
