<template>
	<view class="page pages">
		<view class="header-box" :style="{ paddingTop: systemInfo.statusBarHeight + 'px' }">
			<view class="header-nav" :style="{ height: systemInfo.navBarHeight + 'rpx' }">
				<view class="header-left">
					<image src="/static/images/arrow-left.png" class="img-box" mode="" @click="goBack"></image>
				</view>
				<view class="header-mid">醫療建議書</view>
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
				<!-- <view class="hospital-box__date">
					<view class="">有效期:</view>
					<view class="">2026年5月22日-2026年5月29日</view>
				</view> -->
				<view class="hospital-box__info">
					<!-- <view class="hospital-box__logo">
						<image src="/static/images/logo.png" class="img-box" mode=""></image>
					</view> -->
					<view class="hospital-box__desc">
						<view class="hospital-box__company">廣州南沙信興互聯網醫院有限公司</view>
						<view class="hospital-box__name">{{ detail.hospital }}</view>
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
				<view class="doctor-card-title">醫生信息</view>
				<view class="doctor-card-content">
					<view class="doctor-card-content__avator">
						<image src="/static/images/avator.png" class="img-box" mode=""></image>
					</view>
					<view class="">
						<view class="doctor-card-content__name">接診醫生: {{ detail.doctorName }}</view>
						<view class="doctor-card-content__reg">
							<view class="doctor-card-content__icon"></view>
							<view class="doctor-card-content__text">
								香港西醫註冊編號HK Medical Council Reg. No.： {{ detail.hkCertificate }}
							</view>
						</view>
						<view class="doctor-card-content__no">
							<view class="doctor-card-content__icon"></view>
							<view class="doctor-card-content__text">
								中國執業證書編號 Physician’s Qualification Certificate No.：
								{{ detail.proQualifyCertificate }}
							</view>
						</view>
						<view class="doctor-card-content__address">
							<view class="doctor-card-content__icon"></view>
							<view class="doctor-card-content__text">中國內地執業地點：{{ detail.hospital }}</view>
						</view>
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
							<view class="patient-card-content__text">{{ detail.sex == 1 ? "男" : "女" }}</view>
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
							<image src="/static/images/patient-icon5.png" class="img-box" mode=""></image>
						</view>
						<view class="patient-card-content__desc">
							<view class="patient-card-content__title">診療方式</view>
							<view class="patient-card-content__text">互聯網視診</view>
						</view>
					</view>
					<view class="patient-card-content__info">
						<view class="patient-card-content__icon">
							<image src="/static/images/patient-icon6.png" class="img-box" mode=""></image>
						</view>
						<view class="patient-card-content__desc">
							<view class="patient-card-content__title">患者編號</view>
							<view class="patient-card-content__text">{{ detail.userPatientId }}</view>
						</view>
					</view>
				</view>
			</view>
			<!-- <view class="patient-box"> -->
			<view class="opinion-box">
				<view class="opinion-card-title">診斷意見</view>
				<view class="opinion-card-content">
					{{ detail.diagnosticReport }}
				</view>
			</view>
			<view class="medical-box" v-if="detail.medicineInfo.length">
				<view class="medical-card-title">建議服用藥物</view>
				<view class="medical-card-content">
					<view class="medical-card-content__info" v-for="(item, index) in detail.medicineInfo">
						<view class="medical-card-content__info-name">
							<view class="">{{ item.name }}</view>
							<view class="" style="font-weight: bold">x{{ item.medicineCun }}</view>
						</view>
						<view class="medical-card-content__info-detail">劑量（Strength）：{{ item.spec }}</view>
						<view class="medical-card-content__info-detail" v-if="item.expanded">
							频次：{{ item.frenquency }}
						</view>
						<view class="medical-card-content__info-detail" v-if="item.expanded">
							療程（Duration）：{{ item.duration }}
						</view>
						<view class="medical-card-content__info-detail" v-if="item.expanded">
							特殊用法（Route of Administration）：{{ item.specialPurpose }}
						</view>
						<view class="toggle-btn" @click="toggleExpand(index)">
							{{ item.expanded ? "收起" : "展开" }}
						</view>
						<view class="medical-card-content__info-method">用法：{{ item.directionsRoute }}</view>
						<view class="divider-line" v-if="index != detail.medicineInfo.length - 1"></view>
					</view>
				</view>
			</view>
			<view class="signature-box">
				<view class="signature-title">醫生簽名</view>
				<view class="signature-pic">
					<image :src="detail.doctorSign" mode="" class="img-box"></image>
				</view>
			</view>
			<view class="suggestion-box">
				<view class="suggestion-icon">
					<image src="/static/images/suggestion.png" class="img-box" mode=""></image>
				</view>
				<view class="suggestion-text">
					本文件屬於跨境遠程醫學諮詢與延續用藥建議，不屬於中國內地線下實體藥店之普通處方銷售憑證。
				</view>
			</view>
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
			<view class="tip">
				*溫馨提示：
				您當前查看的內容本文件屬於跨境遠程醫學諮詢與延續用藥建議，不屬於中國內地線下實體藥店之普通處方銷售憑證。如有购药需求点击“去购药”。
			</view>
			<view class="" style="height: 160rpx"></view>
			<!-- 底部去购药按钮 -->
			<view class="bottom-box">
				<view class="btn" :class="{ 'btn-disabled': detail.state != 4 }" @click="detail.state == 4 && open()">
					{{ detail.state == 8 ? "會診結束" : "去購藥" }}
				</view>
			</view>
		</view>
	</view>

	<!-- 跨境购药提示弹窗 -->
	<up-popup v-model:show="showTips" closeable @close="closeShowTips">
		<view class="popup-box">
			<view class="popup-title">跨境購藥提示</view>
			<view class="popup-text">
				<view>您即將跳轉至香港合作藥房平台購買藥品，請注意以下事項：</view>
				<view>1. 藥房位於香港，適用香港法律。</view>
				<view>2. 跨境購藥需遵守內地及香港的相關法律法規。</view>
				<view>3. 部分藥品可能無法進口至內地，或進口時需辦理相關手續。</view>
				<view>4. 關税、運費及清關費用由您自行承擔。</view>
				<view>5. 藥品價格以藥房定價為準，可能與內地價格不同。</view>
				<view>6. 藥品進口可能涉及關税、檢驗檢疫等手續。</view>
				<view>7. 部分藥品可能在國內禁止進口或限制使用。</view>
				<view>8. 跨境購藥產生的糾紛適用當地法律。</view>
				<view>9. 已閲讀並理解第三方平台的服務條款和隱私政策。</view>
				<view>10. 瞭解跨境購藥的相關法律法規</view>
				<view>是否繼續跳轉至藥房平台？</view>
				<view style="color: blue; margin-top: 8rpx" @click="clickProtocol('/static/images/protocol1.png')">
					《處方流轉至藥房協議》
				</view>
				<view style="color: blue; margin-top: 8rpx" @click="clickProtocol('/static/images/protocol2.png')">
					《香港藥房用户協議》
				</view>
				<view style="color: blue; margin-top: 8rpx" @click="clickProtocol('/static/images/protocol3.png')">
					《香港藥房隱私政策》
				</view>
				<view style="color: blue; margin-top: 8rpx" @click="clickProtocol('/static/images/protocol4.png')">
					《香港藥房使用數據協議》
				</view>
			</view>
		</view>
		<view class="popup-bottom">
			<view class="popup-btn-cancel" @click="closeShowTips">取消</view>
			<view class="popup-btn" @click="closeShowTips">確定</view>
		</view>
	</up-popup>

	<!-- 处方单开具弹窗 -->
	<up-popup v-model:show="showTip" closeable @close="closeShowTip">
		<view class="popup-box">
			<view class="popup-title">處方單開具</view>
			<view class="popup-text">
				<view>您的處方單已開具，請注意以下事項：</view>
				<view>1. 處方單有效期為開具之日起3日內，請及時取藥。</view>
				<view>2. 特殊藥品（精神類藥品、冷鏈藥品等）需到指定藥房取藥。</view>
				<view>3. 跨境購藥需遵守相關法律法規，並自行承擔相應風險。</view>
			</view>
		</view>
		<view class="popup-bottom">
			<view class="popup-btn-cancel" @click="closeShowTip">取消</view>
			<view class="popup-btn" @click="closeShowTip">確定</view>
		</view>
	</up-popup>

	<!-- 建议单开具弹窗 -->
	<up-popup v-model:show="showTipSug" closeable @close="closeShowTipSug">
		<view class="popup-box">
			<view class="popup-title">建議單開具</view>
			<view class="popup-text">
				<view>您的建議單已開具，請注意以下事項：</view>
				<view>1. 建議單有效期為開具之日起3日內，請及時取藥。</view>
				<view>2. 特殊藥品（精神類藥品、冷鏈藥品等）需到指定藥房取藥。</view>
				<view>3. 跨境購藥需遵守相關法律法規，並自行承擔相應風險。</view>
			</view>
		</view>
		<view class="popup-bottom">
			<view class="popup-btn-cancel" @click="closeShowTipSug">取消</view>
			<view class="popup-btn" @click="closeShowTipSug">確定</view>
		</view>
	</up-popup>

	<!-- 处方信息确认弹窗 -->
	<up-popup v-model:show="show" closeable @close="close">
		<view class="popup-box">
			<view class="popup-title">處方信息確認</view>
			<view class="popup-text">
				<view>您的以下處方信息將傳輸至香港藥房：</view>
				<view>- 患者姓名</view>
				<view>- 處方內容（包括藥品名稱、規格、數量）</view>
				<view>- 醫生診斷信息</view>
				<view>點擊"確認"即表示您同意上述信息傳輸至香港合作方。</view>
			</view>
		</view>
		<view class="popup-bottom">
			<view class="popup-btn-cancel" @click="close">取消</view>
			<view class="popup-btn" @click="submit">確定</view>
		</view>
	</up-popup>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getPrescriptionDetai, userClickToPurchaseMedicine } from "@/api/base.js";
import { getSystemInfo } from "@/utils/global.js";
const systemInfo = getSystemInfo();
console.log(systemInfo);

const goBack = () => {
	uni.navigateBack();
};

const props = reactive({});
onLoad(({ id }) => {
	props.id = id;
	openShowTipSug();
});

const clickProtocol = (url) => {
	uni.navigateTo({
		url: `/pages/protocol/protocol?url=${encodeURIComponent(url)}`,
	});
};

onShow(() => {
	getDetail();
});
const download = () => {
	const url = detail.value.adviceUrl;

	if (!url) {
		uni.showToast({ title: "暂无图片", icon: "none" });
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
							title: "已保存到相册",
							icon: "none",
						});
					},
					fail: (err) => {
						console.log(err);
						uni.showToast({
							title: "保存失败",
							icon: "none",
						});
					},
				});
			}
		},
		fail: () => {
			uni.showToast({
				title: "下载失败",
				icon: "none",
			});
		},
	});
};
const detail = ref({});
const getDetail = async () => {
	try {
		const params = {
			consultationId: props.id,
		};
		const res = await getPrescriptionDetai(params);
		console.log(res);
		detail.value = res.data.data;
		detail.value.createTime = res.data.data.createTime?.slice(0, 10);
		detail.value.medicineInfo = JSON.parse(res.data.data.medicineInfo).map((item) => ({
			...item,
			expanded: false, // 默认收起
		}));
		console.log(detail.value);
	} catch (error) {
		console.log(error);
	}
};
const toggleExpand = (index) => {
	detail.value.medicineInfo[index].expanded = !detail.value.medicineInfo[index].expanded;
};
const show = ref(false);
const open = () => {
	if (detail.value.state == 4) {
		openShowTips();
	}
};
const close = () => {
	show.value = false;
};
const submit = async () => {
	try {
		const params = { consultationId: detail.value.consultationId, state: 0 };
		const res = await userClickToPurchaseMedicine(params);
		if (res.code == 200) {
			uni.showToast({ mask: true, title: "操作成功", icon: "none" });
			getDetail();
			close();
		}
	} catch (error) {
		console.log(error);
	}
};

const showTip = ref(false);
const openShowTip = () => {
	showTip.value = true;
};
const closeShowTip = () => {
	showTip.value = false;
};

const showTips = ref(false);
const openShowTips = () => {
	showTips.value = true;
};
const closeShowTips = () => {
	showTips.value = false;
	show.value = true;
};

const showTipSug = ref(false);
const openShowTipSug = () => {
	showTipSug.value = true;
};
const closeShowTipSug = () => {
	showTipSug.value = false;
	showTip.value = true;
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
		width: 80rpx;
		height: 80rpx;
		align-self: flex-start;
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
		margin-top: 16rpx;
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
			justify-content: start;
			align-items: center;
			gap: 8rpx;
			// width: 50%;
			padding: 12rpx 0;
			height: fit-content;
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
</style>
