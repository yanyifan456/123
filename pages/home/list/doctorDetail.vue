<template>
	<view class="page pages">
		<view class="content-box">
			<view class="info-box">
				<view class="avator-pic">
					<image :src="detailData.doctorPhoto" mode="" class="img-box img-circle"></image>
				</view>
				<view class="consult-count">
					<view class=""></view>
					<view class="">
						<view class="">预约量</view>
						<view class="">1234</view>
					</view>
				</view>
				<view class="doctorName-box">
					<view class="">{{ detailData.doctorName }}</view>
					<view class="">{{ detailData.departName }}</view>
				</view>
				<view class="hospital-box">
					{{ detailData.hospital }}
				</view>
				<view class="desc-title" v-if="detailData.certification">专业擅长</view>
				<view v-if="detailData.certification">
					<view class="desc-detail" :class="{ expand: isExpand }">
						{{ detailData.certification }}
					</view>
					<view v-if="detailData.certification.length > 40" class="toggle-btn" @click="isExpand = !isExpand">
						{{ isExpand ? "收起" : "展开" }}
					</view>
				</view>
				<view class="blurb-title" v-if="detailData.certification">医生简介</view>
				<view v-if="detailData.certification">
					<view class="blurb-detail" :class="{ expand: isBlurb }">
						{{ detailData.certification }}
					</view>
					<view v-if="detailData.certification.length > 40" class="toggle-btn" @click="isBlurb = !isBlurb">
						{{ isBlurb ? "收起" : "展开" }}
					</view>
				</view>
			</view>
			<view class="evaluate-box">
				<view class="appointment-box">
					<view class="appointment-box-title">患者评价</view>
					<view class="appointment-box-all">
						<view class="appointment-box-all-text">全部</view>
						<view class="appointment-box-all-icon">
							<uni-icons type="right" size="16" color="#a2a2a2"></uni-icons>
						</view>
					</view>
				</view>
				<view class="evaluate-card" v-for="rate in rateList">
					<view class="evaluate-title">
						<view class="">王**</view>
						<up-rate
							:count="rate.rateCount"
							v-model="rate.rateValue"
							activeColor="#459767"
							inactiveColor="#a2a2a2"
							readonly
						></up-rate>
					</view>
					<view class="evaluate-desc">
						{{ rate.text.length < 35 ? rate.text : rate.text.slice(0, 35) + "..." }}
					</view>
				</view>
			</view>
		</view>
		<view class="bottom-box">
			<view class="bottom-btn" @click="handleClick">预约会诊</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getDoctorDetail } from "@/api/base.js";
const props = ref({});
const pic = ref("");
onLoad(({ data }) => {
	props.value = JSON.parse(data);
	getDetail();
	console.log(props.value);
});

const detailData = ref({});

const isExpand = ref(false);
const isBlurb = ref(false);
const getDetail = async () => {
	try {
		const params = {
			doctorId: props.value.doctorId,
		};
		const res = await getDoctorDetail(params);
		console.log(res);
		detailData.value = res.data.data;
	} catch (error) {
		console.log(error);
	} finally {
	}
};

// 评分内容
const rateList = ref([
	{
		text: "冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生",
		rateCount: 5,
		rateValue: 5,
		expanded: false,
	},
	{
		text: "冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生",
		rateCount: 5,
		rateValue: 4,
		expanded: false,
	},
	{
		text: "冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生",
		rateCount: 5,
		rateValue: 3,
		expanded: false,
	},
	{
		text: "冠心病、高血壓、血脂異常、糖尿病、代謝綜合徵等綜合管理與防治，尋求最大程度降低患者的心血管事件發生",
		rateCount: 5,
		rateValue: 2,
		expanded: false,
	},
]);

const handleClick = () => {
	uni.navigateTo({
		url: `/pages/home/list/pay?data=${JSON.stringify(detailData.value)}`,
	});
};
</script>

<style scoped lang="scss">
.pages {
	padding-bottom: 144rpx;
}
.content-box {
	width: 100%;
	// height: 100%;
	scrollbar-width: none;
	background: linear-gradient(to bottom, $primary-light, #ffffff00);
	padding: 104rpx $space-48 0;
}
.info-box {
	width: 100%;
	// height: 416rpx;
	box-shadow: $box-shadow;
	background-color: #fff;
	border-radius: $radius-20;
	padding: $space-32;
	position: relative;
}
.avator-pic {
	position: absolute;
	width: 136rpx;
	height: 136rpx;
	border-radius: 50%;
	border: 1px solid #fff;
	top: -69rpx;
	left: 32rpx;
}
.consult-count {
	@include flex-between;
	> :nth-child(2) {
		width: 184rpx;
		height: 44rpx;
		color: #fff;
		border-radius: $radius-22;
		box-shadow: $box-shadow;
		background: linear-gradient(to bottom, $primary, $primary-light);
		@include flex-center;
		> :nth-child(1) {
			font-size: $font-20;
			margin-right: $space-8;
		}
		> :nth-child(2) {
			font-size: $font-28;
		}
	}
}
.doctorName-box {
	@include flex-start;
	> :nth-child(1) {
		font-size: $font-36;
		color: $text-primary;
		margin-right: $space-16;
	}
	> :nth-child(2) {
		font-size: $font-28;
		color: $text-regular;
	}
}

.hospital-box {
	margin-top: $space-8;
	font-size: $font-28;
	color: $text-regular;
}
.desc-title,
.blurb-title {
	margin-top: $space-24;
	font-size: $font-26;
	color: $text-primary;
}
.desc-detail,
.blurb-detail {
	margin-top: $space-8;
	font-size: $font-24;
	color: $text-secondary;
	text-align: justify;
	line-height: 1.6;

	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2; /* 显示2行 */
	overflow: hidden;
}
.desc-detail.expand {
	-webkit-line-clamp: unset;
}
.blurb-detail.expand {
	-webkit-line-clamp: unset;
}

.toggle-btn {
	margin-top: 10rpx;
	font-size: 24rpx;
	color: $primary;
}

.evaluate-box {
	width: 100%;
	min-height: 100rpx;
	background-color: #fff;
	margin-top: $space-32;
	border-radius: $radius-20;
	box-shadow: $box-shadow;
	padding: $space-32;
}
.appointment-box {
	height: 40rpx;
	margin-top: $space-32;
	font-size: $font-36;
	color: $text-primary;
	@include flex-between;
}

.appointment-box-all {
	@include flex-start;
}

.appointment-box-all-text {
	margin-right: $space-8;
	font-size: $font-24;
	color: $text-secondary;
}

.appointment-box-all-icon {
	width: 32rpx;
	height: 32rpx;
	@include flex-center;
}
.evaluate-card {
	margin-top: $space-24;
	border-bottom: 1px solid $border-color;
	padding-bottom: $space-16;
	&:last-child {
		border-bottom: none;
	}
}
.evaluate-title {
	@include flex-start;
	> :nth-child(1) {
		font-size: $font-28;
		color: $text-regular;
		margin-right: $space-8;
	}
}
.evaluate-desc {
	font-size: $font-24;
	color: $text-regular;
	margin-top: $space-20;
}

.bottom-box {
	background-color: #fff;
	width: 100%;
	height: 128rpx;
	padding: $space-16 $space-48 88rpx;
	position: fixed;
	bottom: 0;
	left: 0;
	z-index: 10;
	.bottom-btn {
		width: 100%;
		height: 92rpx;
		background-color: $primary;
		border-radius: $radius-20;
		color: #fff;
		font-size: $font-28;
		transition: background-color 0.2s ease;
		@include flex-center;
		&:active {
			background-color: rgba($primary, 0.8);
		}
	}
}
</style>