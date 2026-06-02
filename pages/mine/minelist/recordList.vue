<template>
	<view class="box">
		<view
			class="card-box mb-24"
			v-for="(item, index) in medicalList"
			:key="item.id"
			@click="jumpToNextPage(`/pages/mine/minelist/showRecordDetail?id=${item.id}`)"
		>
			<!-- 標題行 -->
			<view class="card-header">
				<text class="fs-28 color-373738">病歷</text>
				<view class="delete-btn" @click.stop="deleteMedical(item)">
					<image src="/static/images/del.png" class="img-box" mode=""></image>
				</view>
			</view>
			<!-- 病情描述 -->
			<view class="fs-24 color-373738 mt-16">
				{{ item.desc }}
			</view>
			<!-- 上傳時間 -->
			<view class="fs-24 color-999 mt-16">上傳時間：{{ item.createTime }}</view>
		</view>

		<view class="bottom-box">
			<view class="btn-box color-fff fs-28" @click="jumpToNextPage(`/pages/mine/minelist/recordDetail`)">
				新增歷史病歷
			</view>
		</view>
	</view>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { setNavigationBar } from "@/utils/navigation.js";
import { jumpToNextPage } from "@/utils/jumpTo";
import { showModal } from "@/utils/feedback";
import { selectCaseList, deleteRecord } from "@/api/yyf.js";

onShow(() => {
	setNavigationBar("病歷管理");
	getList();
});

const medicalList = ref([]);

const getList = async () => {
	try {
		const params = {
			userId: uni.getStorageSync("userId"),
		};
		const res = await selectCaseList(params);
		console.log(res);
		medicalList.value = res.data.data;
	} catch (error) {
		//TODO handle the exception
	}
};

const deleteMedical = async (v) => {
	try {
		const params = {
			delTag: "1",
			userId: uni.getStorageSync("userId"),
			id: v.id,
		};
		const res = await deleteRecord(params);
		uni.showToast({
			title: res.data.message,
			icon: "none",
			mask: true,
		});
		getList();
		console.log(res);
	} catch (error) {
		//TODO handle the exception
		console.log(error);
	}
};
onMounted(() => {});
</script>

<style scoped lang="scss">
.box {
	width: 100vw;
	height: 100vh;
	background: #fafbff;
	box-sizing: border-box;
	padding: 32rpx 48rpx;
	padding-bottom: 200rpx;
}

.card-box {
	width: 100%;
	background: #fff;
	box-shadow: 0rpx 0rpx 16rpx 0rpx rgba(0, 0, 0, 0.0902);
	border-radius: 20rpx 20rpx 20rpx 20rpx;
	box-sizing: border-box;
	padding: 38rpx 32rpx 36rpx;
}

.card-header {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}

.delete-btn {
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 32rpx;
	height: 32rpx;
}

.bottom-box {
	width: 100%;
	height: 200rpx;
	box-sizing: border-box;
	padding: 18rpx 48rpx;
	background: #fff;
	position: fixed;
	bottom: 0;
	left: 0;

	.btn-box {
		width: 100%;
		height: 92rpx;
		background: #459767;
		border-radius: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}

.mb-24 {
	margin-bottom: 24rpx;
}

.mt-16 {
	margin-top: 16rpx;
}

.ml-8 {
	margin-left: 8rpx;
}

.fs-28 {
	font-size: 28rpx;
}

.fs-24 {
	font-size: 24rpx;
}

.color-373738 {
	color: #373738;
}

.color-999 {
	color: #999999;
}

.color-fff {
	color: #ffffff;
}
</style>
