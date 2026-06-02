<template>
	<view class="page pages">
		<view class="top-box">
			<input
				type="text"
				v-model="keyWord"
				class="input"
				@focus="inputFocus"
				placeholder="搜索药品"
				@blur="inputBlur"
				@confirm="inputConfirm"
			/>
			<uni-icons v-if="keyWord" type="clear" size="16" class="clear-btn" @click="clearInput"></uni-icons>
		</view>
		<view class="shop-box">
			<scroll-view scroll-y="true">
				<view
					class="cate-card"
					:class="{ active: currentCate === index }"
					v-for="(item, index) in cateList"
					:key="item.typeId"
					@click="currentCate = index"
				>
					{{ item.typeName }}
				</view>
			</scroll-view>
			<scroll-view scroll-y="true" class="goods-scroll" @scrolltolower="loadMore">
				<view v-if="goods.length" class="goods-list">
					<view v-for="item in goods" :key="item.id" class="goods-card" @click="medicalDetail(item)">
						<view class="goods-pic">
							<image
								:src="item.photo && item.photo !== '-' ? item.photo : '/static/images/medical.png'"
								class="img-box goods-pic"
								mode=""
							></image>
							<view class="medical-type" v-if="item.classType == 0">處方藥</view>
						</view>
						<view class="goods-info">
							{{ item.name.length >= 15 ? item.name.slice(0, 15) + "..." : item.name }}
						</view>
						<view class="goods-company">
							<view class="icon-box-24">
								<image src="/static/images/medical-room.png" mode="" class="img-box"></image>
							</view>
							<view class="">
								{{
									item.pharmacyName &&
									(item.pharmacyName.length >= 7
										? item.pharmacyName.slice(0, 7) + "..."
										: item.pharmacyName)
								}}
							</view>
						</view>
						<view class="goods-price">
							<view class="goods-price-icon">HK$</view>
							<view class="">{{ item.unitPrice }}</view>
						</view>
					</view>
				</view>
				<view v-if="!goods.length" class="empty-box">
					<image src="/static/images/empty.png" class="empty-img"></image>
					<view class="empty-text">当前商城药品正在筹备中，敬请期待~</view>
				</view>

				<view v-if="goods.length" class="load-text">
					{{ goods.length >= total ? "我是有底线的" : "加载中..." }}
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { getMedicalList, getMedicalType } from "@/api/base.js";
import { onShow } from "@dcloudio/uni-app";
onShow(() => {
	getCateList();
});
const keyWord = ref("");
const inputFocus = () => {
	// 聚焦时切换到全部分类
	currentCate.value = 0;
};
const clearInput = () => {
	keyWord.value = "";
	medicalName.value = "";
	currentCate.value = 0;
	cateId.value = null;
	current.value = 1;
	goods.value = [];
	goodsList();
};
const inputConfirm = () => {
	// 搜索时默认切换到全部分类
	currentCate.value = 0;
	medicalName.value = keyWord.value;

	current.value = 1;
	goods.value = [];

	goodsList();
};

const inputBlur = () => {
	if (medicalName.value === keyWord.value) return;

	currentCate.value = 0;
	medicalName.value = keyWord.value;

	current.value = 1;
	goods.value = [];

	goodsList();
};

const currentCate = ref(0);

// 分类列表
const cateList = ref([]);
const getCateList = async () => {
	try {
		const res = await getMedicalType({});
		const list = res.data.data || [];
		cateList.value = [
			{
				typeId: null,
				typeName: "全部",
			},
			...list,
		];
	} catch (error) {
		//TODO handle the exception
		console.log(error);
	} finally {
	}
};
const medicalName = ref("");
const cateId = ref(null);
// 监听分类列表（页面初始化加载数据）
watch(cateList, () => {
	if (!cateList.value.length) return;

	cateId.value = cateList.value[currentCate.value]?.typeId || null;

	current.value = 1;
	goods.value = [];

	goodsList();
});

// 监听分类切换
watch(currentCate, () => {
	if (!cateList.value.length) return;

	// 清空搜索
	keyWord.value = "";
	medicalName.value = "";

	cateId.value = cateList.value[currentCate.value]?.typeId || null;

	current.value = 1;
	goods.value = [];

	goodsList();
});
// 商品列表
const current = ref(1);
const page = ref(10);
const goods = ref([]);
const total = ref(0);
const loading = ref(false);
// classType; // (处方药 0 非处方药 1)
const goodsList = async () => {
	try {
		if (loading.value) return;
		loading.value = true;
		const params = {
			current: current.value,
			pageSize: page.value,
		};
		// 只有当有搜索关键字才传 name
		if (medicalName.value) params.name = medicalName.value;
		// 只有当 cateId 不为空才传 type
		if (cateId.value) params.type = cateId.value;

		const res = await getMedicalList(params);
		const list = res.data.data || [];

		if (current.value === 1) {
			goods.value = list;
		} else {
			goods.value = [...goods.value, ...list];
		}
		total.value = res.data.total;
	} catch (error) {
		console.log(error);
	} finally {
		loading.value = false;
	}
};
const loadMore = () => {
	if (goods.value.length >= total.value) return;

	current.value++;

	goodsList();
};
const medicalDetail = (v) => {
	uni.navigateTo({
		url: "/pages/home/list/medicalDetail" + `?id=${v.id}`,
	});
};
</script>

<style scoped lang="scss">
.pages {
	display: flex;
	flex-direction: column;
}
.top-box {
	background-color: #fff;
	padding: 32rpx 48rpx 24rpx;
	position: sticky;
	top: 0;
	left: 0;
	z-index: 99;
}
.input {
	height: 80rpx;
	border-radius: $radius-20;
	text-align: left;
	box-sizing: border-box;
	padding: 0 80rpx 0rpx 32rpx;
	background-color: $bg-page;
	color: $text-secondary;
	font-size: $font-24;
}
.clear-btn {
	position: absolute;
	right: 68rpx;
	top: 50%;
	transform: translateY(-50%);
	color: $text-secondary;
}
.shop-box {
	flex: 1;
	overflow: hidden;
	@include flex-between;
	> :nth-child(1) {
		width: 200rpx;
		height: 100%;
		background-color: #f8f8f8;
	}
	> :nth-child(2) {
		flex: 1;
		height: 100%;
		background-color: #fff;
	}
}

.cate-card {
	width: 200rpx;
	height: 96rpx;
	position: relative;
	color: $text-regular;
	font-size: $font-32;
	// transition: all 0.3s ease;
	@include flex-center;
}
.active {
	background-color: #fff;
	&::before {
		content: "";
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 8rpx;
		height: 32rpx;
		background-color: $primary; // 主色
		border-radius: $radius-4;
	}
}

.goods-scroll {
	padding: 0 48rpx 0 32rpx;
}
.goods-list {
	// display: grid;
	// grid-template-columns: repeat(2, 1fr);
	// gap: 24rpx;
	column-count: 2; /* 两列 */
	column-gap: 24rpx;
}

.goods-card {
	break-inside: avoid;
	transform: translateZ(0);
	width: 223rpx;
	// height: 352rpx;
	background-color: #fff;
	padding-bottom: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: $box-shadow;
	border-radius: $radius-20;
}
.goods-pic {
	width: 223rpx;
	height: 223rpx;
	border-radius: 20rpx 20rpx 0rpx 0rpx;
	position: relative;
}
.medical-type {
	position: absolute;
	top: 24rpx;
	left: 16rpx;
	border-radius: 10rpx;
	width: 74rpx;
	height: 32rpx;
	background-color: $mark;
	color: $bg-card;
	font-size: 20rpx;
	@include flex-center;
}
.goods-info {
	padding-left: $space-16;
	margin-top: $space-12;
	color: $text-primary;
	font-size: $font-28;
}
.goods-company {
	padding-left: $space-16;
	margin-top: $space-12;
	color: $text-primary;
	font-size: $font-20;
	@include flex-start;
	> :nth-child(1) {
		margin-right: 8rpx;
	}
}
.goods-price {
	@include flex-start;
	padding-left: $space-16;
	margin-top: $space-8;
	color: $danger;
	font-size: $font-32;
	.goods-price-icon {
		font-size: $font-24;
	}
}
.empty-box {
	width: 100%;
	min-height: 60vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.empty-img {
	width: 112rpx;
	height: 112rpx;
	margin-bottom: 20rpx;
}

.empty-text {
	font-size: 26rpx;
	color: $text-secondary;
	text-align: center;
}

.load-text {
	text-align: center;
	font-size: 24rpx;
	color: $text-secondary;
	padding: 20rpx 0 40rpx;
}
</style>
