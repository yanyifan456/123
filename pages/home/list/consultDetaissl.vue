<template>
	<view class="page pages">
		<view class="header-box" :style="{ paddingTop: systemInfo.statusBarHeight + 'px' }">
			<view class="header-nav" :style="{ height: systemInfo.navBarHeight + 'rpx' }">
				<view class="header-left">
					<image src="/static/images/arrow-left.png" class="img-box" mode="" @click="goBack"></image>
				</view>
				<view class="header-mid">處方單</view>
				<view class="header-right">
					<view class="header-download-icon" @click="download">
						<image src="/static/images/down.png" class="img-box" mode=""></image>
					</view>
					<!-- <view class="header-download-text">下载</view> -->
				</view>
			</view>
		</view>
		<view class="" style="padding: 0 48rpx">
			<view class="hospital-box">
				<view class="hospital-box__date">
					<view class="">有效期:</view>
					<view class="">{{ detail.timeRange }}</view>
				</view>
				<view class="hospital-box__info">
					<view class="hospital-box__desc">
						<view class="hospital-box__logo" v-if="detail.hospitalPhoto">
							<image :src="detail.hospitalPhoto" class="img-box" mode=""></image>
						</view>
						<view class="hospital-box__company">{{ detail.doctorName }}醫生</view>
						<view class="hospital-box__name">{{ detail.certification }}</view>
						<view class="hospital-box__company">處方單（Prescription）</view>
						<!-- <view class="hospital-box__name">{{ detail.hospital }}</view> -->
						<view class="hospital-box__title">
							<view class="hospital-box__title-left">
								<view class="hospital-box__title-left-icon">
									<image src="/static/images/no.png" class="img-box" mode=""></image>
								</view>
								<view class="hospital-box__title-left-text">單據編號</view>
							</view>
							<view class="hospital-box__title-left">
								<view class="hospital-box__title-left-icon">
									<image src="/static/images/date.png" class="img-box" mode=""></image>
								</view>
								<view class="hospital-box__title-left-text">日期</view>
							</view>
						</view>
						<view class="hospital-box__content">
							<view class="">{{ detail.formId }}</view>
							<view class="">{{ detail.createTime }}</view>
						</view>
					</view>
				</view>
			</view>
			<view class="doctor-box">
				<view class="doctor-card-title">醫生證書資訊</view>
				<view class="doctor-card-content">
					<view class="doctor-card-content__avator">
						<image src="/static/images/avator.png" class="img-box" mode=""></image>
					</view>
					<view class="">
						<!-- <view class="doctor-card-content__name">接診醫生: {{ detail.doctorName }}</view> -->
						<view class="doctor-card-content__reg">
							<view class="doctor-card-content__icon"></view>
							<view class="doctor-card-content__text">HK Medical Council Reg. No.： {{ detail.hkCertificate }}</view>
						</view>
						<view class="doctor-card-content__no">
							<view class="doctor-card-content__icon"></view>
							<view class="doctor-card-content__text">
								中國執業證書編號：
								{{ detail.proQualifyCertificate }}
							</view>
						</view>
						<!-- <view class="doctor-card-content__address">
							<view class="doctor-card-content__icon"></view>
							<view class="doctor-card-content__text">中國內地執業地點：{{ detail.address }}</view>
						</view> -->
					</view>
				</view>
			</view>
			<view class="patient-box">
				<view class="patient-card-title">患者信息</view>
				<view class="patient-card-content">
					<view class="patient-card-content__info">
						<view class="patient-card-content__icon">
							<image src="/static/images/patient-icon1.png" class="img-box" mode=""></image>
						</view>
						<view class="patient-card-content__desc">
							<view class="patient-card-content__title">患者姓名</view>
							<view class="patient-card-content__text">{{ detail.userName }}</view>
						</view>
					</view>
					<view class="patient-card-content__info">
						<view class="patient-card-content__icon">
							<image src="/static/images/patient-icon2.png" class="img-box" mode=""></image>
						</view>
						<view class="patient-card-content__desc">
							<view class="patient-card-content__title">性別</view>
							<view class="patient-card-content__text">{{ detail.sex == 1 ? '男' : '女' }}</view>
						</view>
					</view>
					<view class="patient-card-content__info">
						<view class="patient-card-content__icon">
							<image src="/static/images/patient-icon3.png" class="img-box" mode=""></image>
						</view>
						<view class="patient-card-content__desc">
							<view class="patient-card-content__title">出生日期</view>
							<view class="patient-card-content__text">{{ detail.birthyDay }}</view>
						</view>
					</view>
					<view class="patient-card-content__info">
						<view class="patient-card-content__icon">
							<image src="/static/images/patient-icon4.png" class="img-box" mode=""></image>
						</view>
						<view class="patient-card-content__desc">
							<view class="patient-card-content__title">年齡</view>
							<view class="patient-card-content__text">{{ detail.age }}</view>
						</view>
					</view>
					<view class="patient-card-content__info">
						<view class="patient-card-content__icon">
							<image src="/static/images/patient-icon7.png" class="img-box" mode=""></image>
						</view>
						<view class="patient-card-content__desc">
							<view class="patient-card-content__title">ID no</view>
							<view class="patient-card-content__text">{{ detail.idCardNo }}</view>
						</view>
					</view>
					<view class="patient-card-content__info">
						<view class="patient-card-content__icon">
							<image src="/static/images/patient-icon6.png" class="img-box" mode=""></image>
						</view>
						<view class="patient-card-content__desc">
							<view class="patient-card-content__title">病人編號</view>
							<view class="patient-card-content__text">{{ detail.userPatientId }}</view>
						</view>
					</view>
					<view class="patient-card-content__info">
						<view class="patient-card-content__icon">
							<image src="/static/images/patient-icon8.png" class="img-box" mode=""></image>
						</view>
						<view class="patient-card-content__desc">
							<view class="patient-card-content__title">病人地址</view>
							<view class="patient-card-content__text">{{ detail.houseAddress || '---' }}</view>
						</view>
					</view>
				</view>
			</view>
			<!-- <view class="patient-box"> -->
			<view class="opinion-box">
				<view class="opinion-card-title">診斷 (Diagnosis)</view>
				<!-- 图片处方 -->
				<view class="opinion-card-content" v-if="detail.presType == 1">
					<image :src="detail.consultationMedicine" mode="widthFix" style="width: 100%" />
				</view>
				<!-- 文本处方 -->
				<view class="opinion-card-content" v-else>
					{{ detail.consultationMedicine }}
				</view>
			</view>
			<view class="medical-box">
				<view class="medical-card-title">處方(Presciption):</view>
				<view class="medical-card-content">
					<view class="medical-card-content__info" v-for="(item, index) in detail.medicineInfo">
						<view class="medical-card-content__info-name">
							<view class="">{{ item.name }}</view>
							<view class="" style="font-weight: bold">x{{ item.medicineCun }}</view>
						</view>
						<view class="medical-card-content__info-detail">劑量（Strength）：{{ item.spec }}</view>
						<view class="medical-card-content__info-detail" v-if="item.expanded">频次：{{ item.frenquency }}</view>
						<view class="medical-card-content__info-detail" v-if="item.expanded">療程（Duration）：{{ item.duration }}</view>
						<view class="medical-card-content__info-detail" v-if="item.expanded">特殊用法（Route of Administration）：{{ item.specialPurpose }}</view>
						<view class="toggle-btn" @click="toggleExpand(index)">
							{{ item.expanded ? '收起' : '展开' }}
						</view>
						<view class="medical-card-content__info-method">用法：{{ item.directionsRoute }}</view>
						<view class="divider-line" v-if="index != detail.medicineInfo.length - 1"></view>
					</view>
				</view>
			</view>
			<view class="signature-box">
				<view class="signature-title">醫生簽名蓋章</view>
				<view class="signature-pic">
					<image :src="detail.doctorSign" mode="" class="img-box"></image>
				</view>
			</view>
			<!-- <view class="suggestion-box">
				<view class="suggestion-icon">
					<image src="/static/images/suggestion.png" class="img-box" mode=""></image>
				</view>
				<view class="suggestion-text">
					本文件屬於跨境遠程醫學諮詢與延續用藥建議，不屬於中國內地線下實體藥店之普通處方銷售憑證。
				</view>
			</view> -->
			<view class="address-card">
				<view class="address-box">
					<view class="address-icon">
						<image src="/static/images/address.png" class="img-box" mode=""></image>
					</view>
					<view class="address-text">地址:{{ detail.address }}</view>
				</view>
				<view class="address-box" style="margin: 0">
					<view class="address-icon">
						<image src="/static/images/phone.png" class="img-box" mode=""></image>
					</view>
					<view class="address-text">TEL: {{ detail.contactPhone }}</view>
				</view>
			</view>
			<view class="tip">*溫馨提示： 您當前查看的內容為處方數據，並非真實有效的醫療處方，如需購藥請使用真實處方。</view>
			<view class="" style="height: 160rpx"></view>
			<!-- 底部去购药按钮 -->
			<!-- <view class="bottom-box">
				<view class="btn" :class="{ 'btn-disabled': detail.state != 4 }" @click="detail.state == 4 && open()">
					{{ detail.state == 8 ? "會診結束" : "去購藥" }}
				</view>
			</view> -->
		</view>
	</view>
	<up-popup v-model:show="show" closeable @close="close">
		<view class="popup-box">
			<view class="popup-title">處方下載須知</view>
			<view class="popup-text">
				<view>
					<text class="popup-text-fw">限本人使用：</text>
					本處方僅限您本人使用，不得轉借、截圖轉發或代他人購藥。
				</view>
				<view>
					<text class="popup-text-fw">遵醫囑用藥：</text>
					處方藥需在醫師指導下使用。下載處方後，請仔細閲讀藥品説明書，並嚴格遵循醫囑或藥師的指導進行用藥。
				</view>
				<view>
					<text class="popup-text-fw">有效期限制：</text>
					本處方自開具之日起7天內有效。逾期未下載或購藥，處方將自動失效，如需繼續用藥，需重新問診獲取新處方。
				</view>
				<view>
					<text class="popup-text-fw">責任聲明：</text>
					下載處方即視為您已閲讀、理解並同意以上全部內容。
				</view>
			</view>
		</view>
		<view class="popup-bottom">
			<view class="popup-btn-cancel" @click="close">取消</view>
			<view class="popup-btn" @click="submit">同意並下載</view>
		</view>
	</up-popup>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { getSuggestionDetai } from '@/api/base.js';
import { getSystemInfo } from '@/utils/global.js';
import dayjs from 'dayjs';
const systemInfo = getSystemInfo();
console.log(systemInfo);
const props = reactive({});
onLoad(({ id }) => {
	props.id = id;
});

onShow(() => {
	getDetail();
});
const isImage = (url) => {
	if (!url) return false;

	return /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png|webp|bmp)(\?.*)?$/i.test(url);
};

const download = () => {
	open();
};
const show = ref(false);
const open = () => {
	show.value = true;
};
const close = () => {
	show.value = false;
};
const submit = async () => {
	const url = detail.value.presUrl;

	if (!url) {
		uni.showToast({ title: '暂无图片', icon: 'none' });
		return;
	}

	uni.downloadFile({
		url,
		success: (res) => {
			if (res.statusCode === 200) {
				uni.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: () => {
						uni.showToast({
							title: '已保存到相册',
							icon: 'none'
						});
						close();
					},
					fail: (err) => {
						console.log(err);
						uni.showToast({
							title: '保存失败',
							icon: 'none'
						});
						close();
					}
				});
			}
		},
		fail: () => {
			uni.showToast({
				title: '下载失败',
				icon: 'none'
			});
			close();
		}
	});
};
const detail = ref({});
const getDetail = async () => {
	try {
		const params = { consultationId: props.id };
		const res = await getSuggestionDetai(params);
		detail.value = res.data.data;
		detail.value.createTime = res.data.data.createTime?.slice(0, 10);
		detail.value.medicineInfo = JSON.parse(res.data.data.medicineInfo).map((item) => ({
			...item,
			expanded: false // 默认收起
		}));
		// 有效期
		const start = dayjs(res.data.data.effectiveStartTime.replace(/-/g, '/')).format('YYYY年M月D日');

		const end = dayjs(res.data.data.effectiveEndTime.replace(/-/g, '/')).format('YYYY年M月D日');

		detail.value.timeRange = `${start}-${end}`;
		console.log(detail.value);
	} catch (error) {
		console.log(error);
	}
};
const toggleExpand = (index) => {
	detail.value.medicineInfo[index].expanded = !detail.value.medicineInfo[index].expanded;
};
</script>

<style scoped lang="scss">
.pages {
	box-sizing: border-box;
}
.header-box {
	box-sizing: border-box;
	position: sticky;
	top: 0;
	left: 0;
	background: #fff;
	padding-left: 48rpx;
	padding-right: 48rpx;
	z-index: 999;
	.header-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		.header-left {
			width: 44rpx;
			height: 44rpx;
			overflow: hidden;
			flex-shrink: 0;
		}
		.header-mid {
			font-weight: bold;
			font-size: 32rpx;
			color: #181b19;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.header-right {
			flex-shrink: 0;
			display: flex;
			justify-content: start;
			align-items: center;
			.header-download-icon {
				width: 44rpx;
				height: 44rpx;
				overflow: hidden;
			}
			.header-download-text {
				font-weight: 400;
				font-size: 28rpx;
				color: #181b19;
			}
		}
	}
}

.hospital-box {
	margin-top: 32rpx;
	width: 100%;
	height: fit-content;
	// background: linear-gradient(99deg, #459767 0%, #52ae7b 100%);
	box-shadow: 0rpx 0rpx 24rpx 2rpx rgba(68, 68, 68, 0.1);
	border-radius: 20rpx;
	overflow: hidden;
	&__date {
		height: fit-content;
		background: linear-gradient(99deg, #459767 0%, #52ae7b 100%);
		font-weight: 400;
		font-size: 28rpx;
		color: #ffffff;
		padding: 24rpx 32rpx;
	}
	&__info {
		height: fit-content;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 32rpx;
		display: flex;
		// justify-content: start;
		justify-content: center;
		align-items: center;
		gap: 24rpx;
	}
	&__logo {
		width: 320rpx;
		height: 80rpx;
		align-self: flex-start;
		margin-bottom: 24rpx;
	}
	&__desc {
	}
	&__company {
		font-weight: bold;
		font-size: 32rpx;
		color: #181b19;
	}
	&__name {
		font-weight: 400;
		font-size: 28rpx;
		color: #434343;
		margin: 24rpx 0;
	}
	&__title {
		margin-top: 24rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 64rpx;
	}
	&__title-left {
		display: flex;
		justify-content: start;
		align-items: center;
		width: 50%;
	}
	&__title-left-icon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 8rpx;
	}
	&__title-left-text {
		font-weight: 400;
		font-size: 24rpx;
		color: #a2a2a2;
	}
	&__content {
		margin-top: 8rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 64rpx;
		font-weight: 600;
		font-size: 24rpx;
		color: #434343;
		view {
			width: 50%;
		}
	}
}
.doctor-box {
	height: fit-content;
	background: #ffffff;
	box-shadow: 0rpx 0rpx 24rpx 2rpx rgba(68, 68, 68, 0.1);
	border-radius: 20rpx 20rpx 20rpx 20rpx;
	padding: 32rpx;
	margin-top: 24rpx;
	.doctor-card-title {
		font-weight: 600;
		font-size: 32rpx;
		color: #181b19;
	}
	.doctor-card-content {
		margin-top: 24rpx;
		display: flex;
		align-items: center;
		justify-content: start;
		gap: 24rpx;
		&__avator {
			width: 80rpx;
			height: 80rpx;
			border-radius: 40rpx;
			flex-shrink: 0;
			align-self: flex-start;
		}
		&__name {
			font-weight: 600;
			font-size: 28rpx;
			color: #181b19;
			margin-bottom: 20rpx;
		}
		&__reg,
		&__no,
		&__address {
			display: flex;
			justify-content: start;
			align-items: center;
			gap: 8rpx;
			margin-bottom: 16rpx;
		}
		&__icon {
			width: 16rpx;
			height: 16rpx;
			background: #52ae7b;
			border-radius: 20rpx 20rpx 20rpx 20rpx;
			flex-shrink: 0;
		}
		&__text {
			font-weight: 400;
			font-size: 24rpx;
			color: #434343;
		}
	}
}
.patient-box {
	height: fit-content;
	background: #ffffff;
	box-shadow: 0rpx 0rpx 24rpx 2rpx rgba(68, 68, 68, 0.1);
	border-radius: 20rpx 20rpx 20rpx 20rpx;
	padding: 32rpx;
	margin-top: 24rpx;
	.patient-card-title {
		font-weight: 600;
		font-size: 32rpx;
		color: #181b19;
	}
	.patient-card-content {
		margin-top: 24rpx;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		&__info {
			display: flex;
			align-items: center;
			gap: 8rpx;
			padding: 12rpx 0;
			height: fit-content;
			min-width: 0; // 关键
		}
		&__icon {
			width: 48rpx;
			height: 48rpx;
			border-radius: 8rpx 8rpx 8rpx 8rpx;
			flex-shrink: 0;
		}
		&__title {
			font-weight: 400;
			font-size: 24rpx;
			color: #434343;
			margin-bottom: 8rpx;
		}

		&__text {
			font-weight: 600;
			font-size: 24rpx;
			color: #181b19;

			// 超出自动换行
			word-break: break-all;
			white-space: normal;

			// 关键
			min-width: 0;
			flex: 1;
		}
	}
}
.opinion-box {
	height: fit-content;
	background: #ffffff;
	box-shadow: 0rpx 0rpx 24rpx 2rpx rgba(68, 68, 68, 0.1);
	border-radius: 20rpx 20rpx 20rpx 20rpx;
	padding: 32rpx;
	margin-top: 24rpx;
	.opinion-card-title {
		font-weight: 600;
		font-size: 32rpx;
		color: #181b19;
	}
	.opinion-card-content {
		margin-top: 24rpx;
		font-weight: 400;
		font-size: 28rpx;
		color: #434343;
		white-space: normal;
		word-break: break-word;
		overflow-wrap: break-word;
	}
}
.medical-box {
	height: fit-content;
	background: #ffffff;
	box-shadow: 0rpx 0rpx 24rpx 2rpx rgba(68, 68, 68, 0.1);
	border-radius: 20rpx 20rpx 20rpx 20rpx;
	padding: 32rpx;
	margin-top: 24rpx;
	.medical-card-title {
		font-weight: 600;
		font-size: 32rpx;
		color: #181b19;
	}
	.medical-card-content {
		margin-top: 24rpx;
		&__info {
		}
		&__info-name {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-weight: 400;
			font-size: 28rpx;
			color: #434343;
			margin-bottom: 16rpx;
		}
		&__info-detail {
			font-weight: 400;
			font-size: 24rpx;
			color: #a2a2a2;
			margin-bottom: 8rpx;
		}
		&__info-method {
			margin-top: 8rpx;
			font-weight: 400;
			font-size: 28rpx;
			color: #181b19;
		}
	}
}
.toggle-btn {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #52ae7b;
	font-weight: 500;
	display: inline-block;
}
.signature-box {
	height: fit-content;
	background: #ffffff;
	box-shadow: 0rpx 0rpx 24rpx 2rpx rgba(68, 68, 68, 0.1);
	border-radius: 20rpx 20rpx 20rpx 20rpx;
	padding: 32rpx;
	margin-top: 24rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	.signature-title {
		font-weight: 600;
		font-size: 32rpx;
		color: #181b19;
	}
	.signature-pic {
		width: 120rpx;
		height: 60rpx;
		overflow: hidden;
	}
}
.suggestion-box {
	height: fit-content;
	background: #ffffff;
	box-shadow: 0rpx 0rpx 24rpx 2rpx rgba(68, 68, 68, 0.1);
	border-radius: 20rpx 20rpx 20rpx 20rpx;
	padding: 32rpx;
	margin-top: 24rpx;
	display: flex;
	justify-content: start;
	align-items: center;
	.suggestion-icon {
		width: 48rpx;
		height: 48rpx;
		margin-right: 24rpx;
		flex-shrink: 0;
	}
	.suggestion-text {
		font-weight: 400;
		font-size: 24rpx;
		color: #434343;
	}
}
.address-card {
	height: fit-content;
	background: #ffffff;
	box-shadow: 0rpx 0rpx 24rpx 2rpx rgba(68, 68, 68, 0.1);
	border-radius: 20rpx 20rpx 20rpx 20rpx;
	padding: 32rpx;
	margin-top: 24rpx;
	.address-box {
		display: flex;
		justify-content: start;
		align-items: center;
		margin-bottom: 24rpx;
		.address-icon {
			width: 48rpx;
			height: 48rpx;
			margin-right: 24rpx;
			flex-shrink: 0;
		}
		.address-text {
			font-weight: 400;
			font-size: 24rpx;
			color: #434343;
		}
	}
}
.tip {
	width: 100%;
	height: fit-content;
	background: rgba(#ff4c10, 0.1);
	border-radius: 20rpx 20rpx 20rpx 20rpx;
	// opacity: 0.1;
	font-weight: 400;
	font-size: 24rpx;
	color: #ff4c10;
	margin-top: 24rpx;
	padding: 16rpx 32rpx;
}
/* 分割线 */
.divider-line {
	height: 1rpx;
	background-color: $border-color;
	margin: 24rpx 0;
}

/* 底部按钮 */
.bottom-box {
	background-color: #fff;
	height: 128rpx;
	width: 100%;
	position: absolute;
	bottom: 0;
	left: 0;
	padding: 16rpx 48rpx;

	.btn {
		width: 100%;
		height: 92rpx;
		background: #52ae7b;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 28rpx;
		font-weight: 600;
	}

	.btn.btn-disabled {
		background-color: rgba($text-secondary, 1);
	}
}

/* 弹窗 */
.popup-box {
	box-sizing: border-box;
	height: fit-content;
	padding: 32rpx 48rpx;
}

.popup-title {
	font-weight: 600;
	font-size: 32rpx;
	color: $text-primary;
	display: flex;
	align-items: center;
	justify-content: center;
}

.popup-text {
	margin-top: 32rpx;
	font-weight: 400;
	font-size: 28rpx;
	color: $text-secondary;
}

.popup-bottom {
	width: 100%;
	height: 128rpx;
	background-color: rgba($bg-card, 1);
	padding: 20rpx 48rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24rpx;
}

.popup-btn {
	width: 50%;
	height: 92rpx;
	background-color: rgba($primary-light, 1);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgba($bg-card, 1);
	font-weight: 600;
	font-size: 28rpx;
}

.popup-btn-cancel {
	width: 50%;
	height: 92rpx;
	background-color: rgba($bg-card, 1);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgba($text-primary, 1);
	font-weight: 600;
	font-size: 28rpx;
	border: 1px solid $border-color;
}
.medicine-item {
	margin-bottom: 24rpx;
}

.medicine-name {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-primary;
	line-height: 1.6;
}

.medicine-info {
	font-size: 24rpx;
	color: $text-secondary;
	line-height: 1.8;
	word-break: break-all;
}
.popup-box {
	box-sizing: border-box;
	height: fit-content;
	padding: 32rpx 48rpx;
}

.popup-title {
	font-weight: 600;
	font-size: 32rpx;
	color: $text-primary;
	display: flex;
	align-items: center;
	justify-content: center;
}

.popup-text {
	margin-top: 32rpx;
	font-weight: 400;
	font-size: 28rpx;
	color: $text-secondary;
	view {
		margin-top: 12rpx;
	}
}
.popup-text-fw {
	font-weight: 600;
	color: #181b19;
}
.popup-bottom {
	width: 100%;
	height: 128rpx;
	background-color: rgba($bg-card, 1);
	padding: 20rpx 48rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24rpx;
}

.popup-btn {
	width: 50%;
	height: 92rpx;
	background-color: rgba($primary-light, 1);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgba($bg-card, 1);
	font-weight: 600;
	font-size: 28rpx;
}

.popup-btn-cancel {
	width: 50%;
	height: 92rpx;
	background-color: rgba($bg-card, 1);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgba($text-primary, 1);
	font-weight: 600;
	font-size: 28rpx;
	border: 1px solid $border-color;
}
</style>
