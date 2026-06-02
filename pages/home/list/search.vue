<template>
	<view class="page">
		<view class="content-box">
			<view class="search-box">
				<view class="search-icon">
					<image
						src="https://doctor.gzxinxingyiyuan.com/images/image/home/searchIcon1.png"
						mode=""
						class="img-box"
					></image>
				</view>
				<input
					class="search-text"
					v-model="keyWord"
					placeholder="搜尋醫生、科室、醫院、藥品"
					confirm-type="search"
					@confirm="handleSearch"
					clearable
				/>
				<uni-icons v-if="keyWord" type="clear" size="18" color="#a2a2a2" @click="clearInput" />
			</view>
			<view class="search-info">
				<view class="search-info-title">搜索记录</view>
				<view class="search-info-clear" @click="clearHistory">清空</view>
			</view>
			<view v-if="info.length">
				<view class="hot-card-box">
					<view class="hot-card" v-for="item in info" :key="item" @click="handleHotClick(item)">
						{{ item }}
					</view>
				</view>
			</view>
			<view class="search-info">
				<view class="search-info-title">热门推荐</view>
			</view>
			<view class="hot-card-box">
				<view class="hot-card" v-for="item in hot" @click="handleHotClick(item)">
					{{ item }}
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
const keyWord = ref("");

// 搜索记录
const info = ref([]);

// 热门推荐
const hot = ref(["環球港醫網", "心内科", "骨科", "腫瘤科", "口腔科", "兒科"]);

// 页面加载读取历史
onLoad(() => {
	const history = uni.getStorageSync("searchHistory");
	if (history) {
		info.value = history;
	}
});

// 执行搜索
const handleSearch = () => {
	if (!keyWord.value.trim()) return;

	// 去重
	const index = info.value.indexOf(keyWord.value);
	if (index !== -1) {
		info.value.splice(index, 1);
	}

	// 插入到最前
	info.value.unshift(keyWord.value);

	// 限制最多10条
	if (info.value.length > 10) {
		info.value.pop();
	}

	// 本地存储
	uni.setStorageSync("searchHistory", info.value);

	console.log("开始搜索:", keyWord.value);

	// 跳转搜索结果页
	// uni.navigateTo({ url: `/pages/search/result?keyword=${keyWord.value}` })
};

// 清空输入框
const clearInput = () => {
	keyWord.value = "";
};
// 点击热门
const handleHotClick = (item) => {
	keyWord.value = item;
	handleSearch();
};

// 清空记录
const clearHistory = () => {
	info.value = [];
	uni.removeStorageSync("searchHistory");
};
</script>

<style lang="scss" scoped>
.content-box {
	width: 100%;
	height: 100%;
	padding: $space-32 $space-48;
}
.search-box {
	width: 100%;
	height: 100rpx;
	background-color: #fff;
	border-radius: $radius-16;
	box-shadow: $box-shadow;
	@include flex-start;
}
.search-icon {
	width: 36rpx;
	height: 36rpx;
	margin-right: $space-8;
	margin-left: $space-32;
}
.search-text {
	width: 80%;
	color: $text-secondary;
	font-size: $font-28;
}
.search-info {
	margin-top: $space-48;
	@include flex-between;
}
.search-info-title {
	color: $text-primary;
	font-size: $font-28;
}
.search-info-clear {
	color: $text-secondary;
	font-size: $font-24;
}
.hot-card-box {
	margin-top: $space-20;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 24rpx;
}
.hot-card {
	width: 202rpx;
	height: 52rpx;
	background-color: rgba($border-color, 0.4);
	border-radius: $radius-16;
	font-size: $font-24;
	color: $text-secondary;

	@include flex-center;
}
</style>
