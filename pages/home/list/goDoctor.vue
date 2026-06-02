<template>
	<view class="page">
		<view class="top-box">
			<view class="search-box">
				<view class="">
					<uni-icons type="search" size="18" color="#a2a2a2"></uni-icons>
					<input
						class="ipt"
						type="text"
						v-model="keyWord"
						placeholder="搜索医生、科室、医院"
						@confirm="inputConfirm"
					/>
				</view>
				<uni-icons type="clear" size="18" color="#a2a2a2" v-if="keyWord" @click="handleClickClear"></uni-icons>
			</view>
			<up-tabs
				:activeStyle="{ color: '#459767' }"
				lineColor="#459767"
				:current="tabsCurrent"
				:list="tabList"
				@change="changeTabs"
			></up-tabs>
		</view>
		<scroll-view
			scroll-y="true"
			class="scroll-box"
			lower-threshold="80"
			@scrolltolower="handleLoadMore"
			v-if="tabsCurrent == 0"
		>
			<view class="doctor-card" v-for="item in list" :key="item.doctor" @click="handleClickDetail(item)">
				<view style="overflow: hidden">
					<image :src="item.doctorPhoto" mode="" class="img-box"></image>
				</view>
				<view>
					<view>
						<view>{{ item.doctorName }}</view>
						<view>{{ item.profession }}</view>
					</view>
					<view>{{ item.departName }}</view>
					<view>{{ item.proSkill }}</view>
					<view>
						<view>
							<text style="font-size: 20rpx">￥</text>
							<text>{{ item.mainlandFee }}</text>
						</view>
						<view>预约费</view>
					</view>
				</view>
			</view>
			<!-- loading -->
			<view class="loading-box" v-if="loading">
				<uni-icons color="#a2a2a2" type="spinner-cycle" size="30"></uni-icons>
			</view>

			<!-- 已到底 -->
			<view class="loading-finish" v-if="finished">我是有底线的</view>
		</scroll-view>
		<view class="depart-box" v-else>
			<view class="depart-card" v-for="item in departList" :key="item.departId" @click="handleClickDepart(item)">
				<view class="depart-card-pic">
					<image :src="item.name" mode="" class="img-box"></image>
				</view>
				<view class="depart-card-text">{{ item.departName }}</view>
			</view>
		</view>
		<view v-if="list.length == 0 && tabsCurrent == 0" class="empty-wrapper">
			<view class="empty-box">
				<view class="no_msg">
					<image src="/static/images/no_msg.png" mode="aspectFit" class="img-box" />
				</view>
				<view class="text">暫無數據</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onShow, onLoad } from "@dcloudio/uni-app";
import { getDoctorList, getDepart } from "@/api/base.js";

// 输入框
const keyWord = ref("");
const handleClickClear = () => {
	keyWord.value = "";

	// ✅ 重置分页状态（关键）
	list.value = [];
	pageNum.value = 1;
	finished.value = false;

	getList();
};
const inputConfirm = () => {
	console.log(keyWord.value);
	list.value = [];
	pageNum.value = 1;
	finished.value = false;
	getList();
};

// 切换标签
const tabsCurrent = ref(0);
const tabList = reactive([{ name: "找醫生" }, { name: "找科室" }]);
const changeTabs = ({ index }) => {
	tabsCurrent.value = index;
	if (index == 1) {
		getDepartData();
	}
};

// 医生列表
const list = ref([]);

const handleClickDetail = (item) => {
	uni.navigateTo({
		url: `/pages/home/list/doctorDetail?data=${JSON.stringify(item)}`,
	});
};

// 懒加载及其分页
const pageNum = ref(1);
const pageSize = 10;
const loading = ref(false);
const finished = ref(false);
const countUnreadMsg = ref(0);

const getList = async () => {
	if (loading.value || finished.value) return;

	loading.value = true;

	try {
		const res = await getDoctorList({
			doctorName: keyWord.value,
			current: pageNum.value,
			pageSize,
		});
		const { data, total } = res.data;

		countUnreadMsg.value = res.data.countUnreadMsg;

		// 分页追加
		list.value = [...list.value, ...data];
		// list.value = [];
		console.log(list.value);
		// 判断是否到底
		if (list.value.length >= total) {
			finished.value = true;
		} else {
			pageNum.value++;
		}
	} catch (error) {
		console.log("医生列表接口error", error);
	} finally {
		loading.value = false;
	}
};

// 触底
const handleLoadMore = () => {
	getList();
};

onShow(() => {
	list.value = [];
	pageNum.value = 1;
	finished.value = false;
	keyWord.value = "";
	getList();
	getDepartData();
});

// 科室列表
const departList = ref([]);
const getDepartData = async () => {
	try {
		const res = await getDepart({});
		departList.value = res.data.data;
		departList.value.forEach((item, index, arr) => {
			item.name = "https://doctor.gzxinxingyiyuan.com/images/image/doctorList/departmentIcon1.png";
		});
	} catch (error) {
		console.log("科室列表接口error", error);
	} finally {
	}
};

const handleClickDepart = (item) => {
	console.log(item);
	uni.navigateTo({
		url: `/pages/home/list/departDoctor?departId=${item.departId}&departName=${item.departName}`,
	});
};
</script>

<style scoped lang="scss">
.top-box {
	width: 100%;
	position: sticky;
	top: 0;
	left: 0;
	padding: 0 $space-48;
	padding-top: $space-32;
	z-index: 10;
	background-color: $bg-page;
}
.search-box {
	width: 100%;
	height: 72rpx;
	background-color: rgba($text-secondary, 0.1);
	border-radius: $radius-16;
	padding: 0 $space-16;
	@include flex-between;
	> :nth-child(1) {
		@include flex-center;
		flex: 1;
	}
	.ipt {
		width: 100%;
		font-size: $font-24;
		color: $text-secondary;
		margin-left: $space-16;
	}
}
.tabs-box {
	margin-top: $space-32;
}
.scroll-box {
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	padding: 0 $space-48;
}
.doctor-card {
	width: 100%;
	height: 248rpx;
	border-radius: $radius-20;
	background-color: #fff;
	box-shadow: $box-shadow;
	margin-top: $space-20;
	padding: $space-32;
	@include flex-start;
	> :nth-child(1) {
		width: 184rpx;
		height: 184rpx;
		border-radius: $radius-20;
		margin-right: $space-32;
		position: relative;
		> :nth-child(2) {
			width: 50rpx;
			height: 56rpx;
			position: absolute;
			top: 0;
			left: 22rpx;
		}
	}
	> :nth-child(2) {
		flex: 1;
		position: relative;
		> :nth-child(1) {
			@include flex-start;
			> :nth-child(1) {
				color: $text-primary;
				font-size: $font-32;
				margin-right: $space-24;
			}
			> :nth-child(2) {
				color: $text-regular;
				font-size: $font-24;
			}
		}

		> :nth-child(2) {
			margin-top: $space-20;
			color: $text-secondary;
			font-size: $font-24;
		}

		> :nth-child(3) {
			width: fit-content;
			margin-top: $space-20;
			color: $primary;
			font-size: $font-24;
			padding: $space-8 $space-16;
			border: 1px solid $primary;
			border-radius: $radius-20;
		}

		> :nth-child(4) {
			@include flex-start-baseline;
			position: absolute;
			bottom: 0;
			right: 0;
			color: $primary;
			font-size: $font-24;
			> :nth-child(1) {
				margin-right: $space-8;
				font-size: $font-28;
				color: $danger;
			}

			> :nth-child(2) {
				font-size: $font-20;
				color: $text-regular;
			}
		}
	}
}
.loading-box {
	margin-top: $space-12;
	@include flex-center;
}
.loading-finish {
	width: 100%;
	height: 160rpx;
	padding: $space-20 $space-48;
	color: $text-secondary;
	@include flex-center;
}
.depart-box {
	padding: 0 $space-48;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 24rpx;
	margin-top: $space-20;
}
.depart-card {
	width: 146rpx;
	height: 146rpx;
	background-color: #fff;
	border-radius: $radius-20;
	box-shadow: $box-shadow;
	@include flex-col-center;
}
.depart-card-pic {
	width: 64rpx;
	height: 64rpx;
}
.depart-card-text {
	margin-top: $space-16;
	color: $text-primary;
	font-size: $font-26;
}
.empty-wrapper {
	width: 100%;
	height: 100%;
	@include flex-center;
}
.empty-box {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.no_msg {
	width: 160rpx;
	height: 160rpx;
}
.text {
	margin-top: $space-20;
	color: $text-secondary;
}
</style>
