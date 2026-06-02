<template>
	<view class="page">
		<view class="content-box" v-if="detail.value != 0">
			<view class="time">{{ detail.createTime }}</view>
			<view class="desc">
				{{ detail.msgContent }}
			</view>
		</view>
		<view class="content-box" v-else>
			<view class="no_data">暫無數據</view>
		</view>
	</view>
</template>

<script setup>
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getMsgDetail } from "@/api/base";
import { ref } from "vue";

onLoad((options) => {
	getDetail(options.id);
});

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
};
// 设置页面标题
const setNavTitle = (title) => {
	uni.setNavigationBarTitle({
		title,
	});
};

const detail = ref({});

const getDetail = async (id) => {
	try {
		const res = await getMsgDetail({ id });
		console.log(res);
		detail.value = res.data.data;
		setNavTitle(msgConfig[res.data.data.msgType].label);
	} catch (error) {
		//TODO handle the exception
		console.log("消息详情接口error", error);
	} finally {
	}
};
</script>

<style lang="scss" scoped>
.content-box {
	width: 100%;
	height: 100%;
	padding: $space-32 $space-48;
}
.time {
	font-size: $font-24;
	color: $text-secondary;
	@include flex-center;
}
.desc {
	background-color: #fff;
	color: $text-regular;
	margin-top: $space-24;
	padding: $space-16;
	border-radius: $radius-20;
}
.no_data {
	font-size: $font-32;
	color: $text-secondary;
	@include flex-center;
}
</style>
