<template>
	<view class="page">
		<scroll-view
			scroll-y="true"
			class="scroll-box"
			lower-threshold="80"
			@scrolltolower="handleLoadMore"
			v-if="list.length != 0"
		>
			<view class="">
				<view
					class="msg_card"
					v-for="item in list"
					:style="{ backgroundColor: item.readTag == 1 ? '#f8f8f8' : '#ffffff' }"
					@click="handleClickDetail(item)"
				>
					<view class="msg_content">
						<view class="msg_avator" :class="{ unread: item.readTag != 1 }">
							<!-- <image :src="msgConfig[item.msgType]?.avatar" mode="" class="img-box"></image> -->
							<image src="/static/images/4.png" mode="" class="img-box"></image>
						</view>
						<view class="msg_main">
							<view class="msg_type_time">
								<view class="msg_type">{{ msgConfig[item.msgType]?.label || "系统消息" }}</view>
								<view class="msg_time">{{ item.createTime }}</view>
							</view>
							<view class="msg_desc">
								{{ item.msgContent.length < 20 ? item.msgContent : item.msgContent + "..." }}
							</view>
						</view>
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
		<view v-if="list.length == 0" class="empty-wrapper">
			<view class="empty-box">
				<view class="no_msg">
					<image src="/static/images/no_msg.png" mode="aspectFit" class="img-box" />
				</view>
				<view class="text">暫無消息</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch } from "vue";
import { updateTabbarBadge } from "@/utils/tabBarBadge.js";
import { onLoad, onShow, onReady } from "@dcloudio/uni-app";
import { getMsgList } from "@/api/base";
// 消息类型统一配置
const msgConfig = {
	1: {
		label: "預約提醒",
		avatar: "/static/images/4.png",
	},
	2: {
		label: "證件待審核",
		avatar: "/static/images/5.png",
	},
	3: {
		label: "證件審核通過",
		avatar: "/static/images/2.png",
	},
	4: {
		label: "證件審核不通過",
		avatar: "/static/images/1.png",
	},
	5: {
		label: "買藥支付",
		avatar: "/static/images/3.png",
	},
	6: {
		label: "藥房審核通過",
		avatar: "/static/images/7.png",
	},
	7: {
		label: "藥房審核不通過",
		avatar: "/static/images/6.png",
	},
	8: {
		label: "退款審核",
		avatar: "/static/images/8.png",
	},
	11: {
		label: "病历审核通过",
		avatar: "/static/images/4.png",
	},
	12: {
		label: "病历审核不通过",
		avatar: "/static/images/4.png",
	},
};

//  消息列表
const list = ref([]);

// 懒加载及其分页
const pageNum = ref(1);
const pageSize = 10;
const loading = ref(false);
const finished = ref(false);
const countUnreadMsg = ref(0);

const getList = async () => {
	if (!uni.getStorageSync("phone")) return;
	if (loading.value || finished.value) return;

	loading.value = true;

	try {
		const res = await getMsgList({
			telphone: uni.getStorageSync("phone"),
			pageSize,
			pageNum: pageNum.value,
		});

		const { data, total } = res.data;

		countUnreadMsg.value = res.data.countUnreadMsg;

		// 分页追加
		list.value = [...list.value, ...data];

		// 判断是否到底
		if (list.value.length >= total) {
			finished.value = true;
		} else {
			pageNum.value++;
		}
		console.log(list.value);
	} catch (error) {
		console.log("消息列表接口error", error);
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
	getList();
});
// 监听并设置消息徽标
const updateBadge = () => {
	updateTabbarBadge(1, countUnreadMsg.value);
};

watch(
	countUnreadMsg,
	(val) => {
		updateTabbarBadge(1, val);
	},
	{ immediate: true },
);

// 详情
const handleClickDetail = (val) => {
	uni.navigateTo({
		url: `/pages/message/messageDetail?id=${val.id}`,
	});
};
</script>

<style lang="scss" scoped>
.scroll-box {
	height: 100%;
}
.msg_card {
	width: 100%;
	height: 160rpx;
	padding: $space-20 $space-48;
}
.msg_content {
	width: 100%;
	height: 100%;
	@include flex-between;
}
.msg_avator {
	width: 80rpx;
	height: 80rpx;
	margin-right: $space-32;
	position: relative;
}
.msg_avator.unread::after {
	content: "";
	position: absolute;
	top: 0;
	right: 0;
	width: 24rpx;
	height: 24rpx;
	background-color: $danger;
	border-radius: 50%;
}
.msg_main {
	flex: 1;
	height: 100%;
	padding: $space-8 $space-0;
}
.msg_type_time {
	margin-bottom: $space-24;
	@include flex-between;
}
.msg_type {
	color: $text-primary;
	font-size: $font-28;
}
.msg_time {
	color: $text-secondary;
	font-size: $font-20;
}
.msg_desc {
	color: $text-secondary;
	font-size: $font-24;
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
</style>
