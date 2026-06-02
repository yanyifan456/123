<template>
	<view class="page">
		<view class="person-info">
			<view class="user-card">
				<view class="user-left">
					<image class="avatar" :src="formData.profilePicture || defaultAvatar" mode="aspectFill" />
					<view class="user-text">
						<view class="user-name">
							<text style="font-weight: bold">{{ formData.userName || '--' }}</text>
							<view class="aaaaa">
								<text
									:style="{
										fontSize: '24rpx',
										color: aassdd == '1' ? '#ffffff' : '#ffffff'
									}"
								>
									{{ aassdd == '1' ? '已签署' : '未签署' }}
								</text>
							</view>
						</view>
						<view class="user-phone">
							{{ formData.phone || '--' }}
						</view>
					</view>
				</view>
				<view class="edit-btn" @click="goPage('/pages/mine/minelist/EditProfile')">
					<up-icon name="edit-pen" size="14" />
					<text>編輯資料</text>
				</view>
			</view>
		</view>
		<view class="content">
			<view class="qs" v-if="aassdd === '0'">
				<image class="qs-icon-left" src="/static/img/30.png" mode="aspectFit" />
				<text class="qs-text">未簽署合規文件</text>
				<view class="qs-right" @click="goqianshu">
					<text class="qs-action">去簽署</text>
					<image class="qs-icon-right" src="/static/img/31.png" mode="aspectFit" />
				</view>
			</view>
			<view class="vip-box">
				<image
					class="vip-bg-img"
					src="http://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEBGe9oupI-TdZRNovsYAyJbkpyGlnjmAACOSEAAi5q2VUMyOGpCGalpTYE.png"
					mode="aspectFill"
				/>
				<view class="vip-content">
					<view class="vip-text">
						開通會員，每月立省
						<text class="vip-money">199</text>
						元
					</view>
					<view class="vip-btn">成為會員</view>
				</view>
			</view>
			<view class="card">
				<view class="section-header">
					<view class="section-title">預約記錄</view>
					<view class="section-more" @click.stop="goOrderList">
						<text>查看全部</text>
						<up-icon name="arrow-right" size="14" />
					</view>
				</view>
				<view class="order-grid">
					<view v-for="(item, index) in orderList" :key="index" class="order-item" @click="goOrderTab(item)">
						<image class="order-icon" :src="item.icon" />
						<text class="grid-text">{{ item.title }}</text>
					</view>
				</view>
			</view>
			<view class="card">
				<view class="section-header">
					<view class="section-title">華興藥房 </view>
					<view class="section-more" @click.stop="gorecord">
						<text>查看全部</text>
						<up-icon name="arrow-right" size="14" />
					</view>
				</view>
				<view class="serve-grid">
					<view v-for="(item, index) in serviceLists" :key="item.key" class="serve-item" @click="goRecordTab(index)">
						<image class="serve-icon" :src="item.icon" />
						<text class="grid-text">{{ item.key }}</text>
					</view>
				</view>
			</view>
			<view class="card">
				<view class="section-header">
					<view class="section-title">我的服務</view>
					<view class="section-more" @click.stop="toastAll">
						<text>查看全部</text>
						<up-icon name="arrow-right" size="14" />
					</view>
				</view>
				<view class="serve-grid">
					<view v-for="item in serviceList" :key="item.key" class="serve-item" @click="handleService(item)">
						<image class="serve-icon" :src="item.icon" />
						<text class="grid-text">{{ item.key }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="modal-mask" v-if="showLogoutModal" @click="showLogoutModal = false">
			<view class="modal-box" @click.stop>
				<view class="modal-title">退出登錄</view>
				<view class="modal-content">即將退出當前賬號，你的賬號信息與數據會妥善保留，確認要退出登錄？</view>
				<view class="modal-btns">
					<view class="aaa" @click="showLogoutModal = false">取消</view>
					<view class="bbb" @click="confirmLogout">確定</view>
				</view>
			</view>
		</view>
		<view class="modal-mask" v-if="showHelpModal" @click="showHelpModal = false">
			<view class="modal-box" @click.stop>
				<view class="modal-title">幫助中心</view>
				<view class="modal-content help-content">
					<text class="help-tip">點擊鏈接進行查看</text>
					<text class="help-link" style="margin-bottom: 20rpx" @click="openHelpLink">
						<span style="color: #434343">簡體版</span>
						港醫網用户手冊
					</text>
					<text class="help-link" @click="openHelpLinks">
						<span style="color: #434343">繁體版</span>
						港醫網用户手冊
					</text>
				</view>
				<view class="modal-btns">
					<view class="aaa" @click="showHelpModal = false">取消</view>
					<view class="bbb" @click="confirmHelp">確定</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { jumpToNextPage } from '@/utils/jumpTo.js';
import { getuser } from '@/api/login.js';

import { signature, jiaoyan } from '@/api/yyf.js';
const aassdd = ref();

const defaultAvatar = '/static/img/2.png';
const formData = ref({
	userName: '',
	phone: '',
	profilePicture: ''
});
const qsxinx = ref()
// 弹窗控制
const showLogoutModal = ref(false);
const showHelpModal = ref(false);
/* 订单数据 */
const orderList = ref([
	{
		icon: 'https://doctor.gzxinxingyiyuan.com/images/image/mine/orderIcon1.png',
		title: '待支付',
		oo: '2'
	},
	{
		icon: 'https://doctor.gzxinxingyiyuan.com/images/image/mine/orderIcon2.png',
		title: '待會診',
		oo: '3'
	},
	{
		icon: 'https://doctor.gzxinxingyiyuan.com/images/image/mine/orderIcon3.png',
		title: '取消預約',
		oo: '4'
	},
	{
		icon: '/static/img/12.png',
		title: '已完成',
		oo: '5'
	}
]);
/* 服务数据（数据驱动） */
const serviceList = ref([
	{
		key: '退款/售后',
		icon: '/static/img/26.png',
		path: '/pages/mine/refund/sqtk'
		// path: "/pages/home/list/myDevice"
	},
	{
		key: '病歷管理',
		icon: 'https://doctor.gzxinxingyiyuan.com/images/image/mine/serveIcon4.png',
		// path: '/pages/mine/minelist/recordList'
		path: ''
	},
	{
		key: '地址管理',
		icon: 'https://doctor.gzxinxingyiyuan.com/images/image/mine/serveIcon1.png',
		path: '/pages/mine/minelist/addressManage'
	},
	{
		key: '意見反饋',
		icon: 'https://doctor.gzxinxingyiyuan.com/images/image/mine/serveIcon2.png',
		path: '/pages/mine/minelist/opinion'
	},
	{
		key: '關於我們',
		icon: 'https://doctor.gzxinxingyiyuan.com/images/image/mine/serveIcon3.png',
		path: '/pages/mine/minelist/aboutWe'
	},
	{
		key: '幫助中心',
		icon: 'https://doctor.gzxinxingyiyuan.com/images/image/mine/serveIcon5.png',
		path: ''
	},
	{
		key: '聯繫客服',
		icon: 'https://doctor.gzxinxingyiyuan.com/images/image/mine/serveIcon8.png',
		path: '/pages/mine/minelist/Contactcustomerservice'
	},
	{
		key: '退出登錄',
		icon: '/static/img/6.png'
		// path: "/pagesA/invoice/invoice"
	}
]);
const serviceLists = ref([
	{
		key: '待配藥',
		icon: '/static/img/13.png',
		path: '/pages/mine/minelist/addressManage'
	},
	{
		key: '待發貨',
		icon: '/static/img/14.png',
		path: '/pages/mine/minelist/opinion'
	},
	{
		key: '待收貨',
		icon: '/static/img/15.png',
		path: '/pages/mine/minelist/aboutWe'
	},
	{
		key: '已完成',
		icon: '/static/img/16.png',
		path: '/pages/mine/minelist/recordList'
	}
]);
/* 通用跳转 */
const goPage = (url) => {
	if (!url) return;
	uni.navigateTo({
		url
	});
};
const aaaddssd = async () => {
	const userId = uni.getStorageSync('userId');
	const res = await jiaoyan({ userId });
	if (res.code === '200') {
		aassdd.value = res.data.signTag;
		console.log(aassdd.value);
		
			uni.setStorageSync("isWrite",aassdd.value)
			console.log(aassdd.value);
	}
};
/* 订单跳转 */
const goOrderList = () => {
	jumpToNextPage(`/pages/home/list/appointmentInfo`);
};
// script里新增方法
const goRecordTab = (index) => {
	// 待配药=1, 待发货=2, 待收货=3, 已完成=4
	jumpToNextPage(`/pages/mine/Record/index?current=${index + 1}`);
};
// 修改gorecord方法，默认跳转到第一个tab（待付款）
const gorecord = () => {
	jumpToNextPage(`/pages/mine/Record/index?current=0`);
};
const goOrderTab = (item) => {
	console.log(item.oo);
	jumpToNextPage(`/pages/home/list/appointmentInfo?tabsCurrent=${item.oo}`);
};
/* 服务点击 */
const handleService = (item) => {
	// 退出登录特殊处理
	if (item.key === '退出登錄') {
		showLogoutModal.value = true;
		return;
	}
	// 帮助中心特殊处理
	if (item.key === '幫助中心') {
		showHelpModal.value = true;
		return;
	}
	if (!item.path) {
		uni.showToast({
			title: '功能開發中',
			icon: 'none'
		});
		return;
	}
	goPage(item.path);
};
// 确认退出登录
const confirmLogout = () => {
	showLogoutModal.value = false;
	uni.clearStorageSync();
	uni.reLaunch({
		url: '/pages/login/login'
	});
};
// 确认帮助中心
const confirmHelp = () => {
	const url = 'https://www.baidu.com';
	showHelpModal.value = false;
	// H5
	// #ifdef H5
	window.open(url);
	// #endif
	// APP
	// #ifdef APP-PLUS
	plus.runtime.openURL(url);
	// #endif
	// 小程序
	// #ifdef MP
	uni.navigateTo({
		url: '/pages/webview/webview?url=' + encodeURIComponent(url)
	});
	// #endif
};
const toastAll = () => {
	uni.showToast({
		title: '已經是全部了',
		icon: 'none'
	});
};
const getlist = async () => {
	try {
		console.log(1);
		const res = await getuser({
			serialNumber: uni.getStorageSync('phone')
		});
		console.log(res);
		if (res.code == '200') {
			formData.value.userName = res.data.data.userName;
			formData.value.phone = res.data.data.serialNumber;
			formData.value.profilePicture = res.data.data.profilePicture;
			qsxinx.value = res.data.data
		}
	} catch (error) {
		//TODO handle the exception
		console.log(error);
	} finally {
		console.log(2);
	}
};
const openHelpLink = () => {
	const url = 'http://testgy.gzxinxingyiyuan.com/download/usermanual';
	uni.showLoading({
		title: '下载中...'
	});
	uni.downloadFile({
		url,
		success: (res) => {
			uni.hideLoading();

			if (res.statusCode === 200) {
				const filePath = res.tempFilePath;

				// 打开文档
				uni.openDocument({
					filePath: filePath,
					showMenu: true,
					success: (res) => {
						console.log(res);
					},
					fail: (err) => {
						console.error('打开失败', err);
						uni.showToast({
							title: '无法打开文件',
							icon: 'none'
						});
					}
				});
			} else {
				uni.showToast({
					title: '下载失败',
					icon: 'none'
				});
			}
		},
		fail: (err) => {
			uni.hideLoading();
			console.error('下载失败', err);
			uni.showToast({
				title: '下载失败',
				icon: 'none'
			});
		}
	});
};
const openHelpLinks = () => {
	const url = 'http://testgy.gzxinxingyiyuan.com/download/hkusermanual';
	uni.showLoading({
		title: '下载中...'
	});
	uni.downloadFile({
		url,
		success: (res) => {
			uni.hideLoading();

			if (res.statusCode === 200) {
				const filePath = res.tempFilePath;
				// 打开文档
				uni.openDocument({
					filePath: filePath,
					showMenu: true,
					success: (res) => {
						console.log(res);
					},
					fail: (err) => {
						console.error('打开失败', err);
						uni.showToast({
							title: '无法打开文件',
							icon: 'none'
						});
					}
				});
			} else {
				uni.showToast({
					title: '下载失败',
					icon: 'none'
				});
			}
		},
		fail: (err) => {
			uni.hideLoading();
			console.error('下载失败', err);
			uni.showToast({
				title: '下载失败',
				icon: 'none'
			});
		}
	});
};
const goqianshu = async () => {
	const params = {
		realName: qsxinx.value.userName,
		idCardNo:  qsxinx.value.idCardNo,
		mobile:  qsxinx.value.serialNumber
	};
	const res = await signature(params);
	console.log(res);
	if (res.data.code === '1000') {
		uni.setStorageSync('sign', res.data.sign);
		uni.navigateTo({
			url: '/pages/mine/qs'
		});
	} else {
		uni.showToast({
			title: '签署失败',
			icon: 'none'
		});
	}
};
onShow(() => {
	aaaddssd();
	getlist();
});
</script>
<style scoped lang="scss">
.aaa {
	width: 210rpx;
	height: 80rpx;
	border-radius: 20rpx;
	border: 2rpx solid #d8d8d8;
	text-align: center;
	line-height: 80rpx;
}

.bbb {
	width: 210rpx;
	height: 80rpx;
	background: #52ae7b;
	border-radius: 20rpx;
	text-align: center;
	line-height: 80rpx;
	color: #fff;
}

.page {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f8f8f8;
}

.person-info {
	height: 176rpx;
	background: linear-gradient(to bottom, #b3dcc5 0%, #fff 100%);
	padding: 32rpx 48rpx;
	box-sizing: border-box;
}

.content {
	padding: 0 48rpx;
	box-sizing: border-box;
}

.user-card {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.user-left {
	display: flex;
	align-items: center;
}

.avatar {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
}

.user-text {
	margin-left: 32rpx;
}

.user-name {
	font-size: 30rpx;
	color: #434343;
	display: flex;
}

.user-phone {
	font-size: 26rpx;
	color: #373738;
	margin-top: 12rpx;
}

.edit-btn {
	display: flex;
	align-items: center;
	font-size: 24rpx;
	color: #181b19;
}

/* ===== 卡片统一风格 ===== */
.card {
	border-radius: 20rpx;
	background: #fff;
	padding: 38rpx 32rpx 36rpx;
	box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 32rpx;
}

/* ===== 通用标题 ===== */
.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 24rpx;
}

.section-title {
	font-size: 30rpx;
	color: #373738;
	font-weight: 500;
}

.section-more {
	display: flex;
	align-items: center;
	font-size: 24rpx;
	color: #979698;
}

.section-more text {
	margin-right: 8rpx;
}

/* ===== VIP ===== */
.vip-box {
	width: 100%;
	height: 160rpx;
	border-radius: 26rpx;
	overflow: hidden;
	position: relative;
	margin-bottom: 32rpx;
}

.vip-bg-img {
	position: absolute;
	width: 100%;
	height: 100%;
}

.vip-content {
	position: relative;
	z-index: 1;
	height: 100%;
	padding: 32rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.vip-text {
	margin-top: 80rpx;
	font-size: 28rpx;
	color: rgba(255, 213, 168, 0.6);
	display: flex;
	align-items: flex-end;
}

.vip-money {
	color: #eecc92;
	margin: 0 4rpx;
}

.vip-btn {
	width: 132rpx;
	height: 52rpx;
	border-radius: 26rpx;
	background: linear-gradient(161deg, #efcc98 0%, #deae68 100%);
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 24rpx;
	color: #fff;
}

/* ===== 订单 ===== */
.order-grid {
	display: flex;
	justify-content: space-around;
}

.order-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.order-icon {
	width: 60rpx;
	height: 60rpx;
}

/* ===== 服务 ===== */
.serve-grid {
	display: flex;
	flex-wrap: wrap;
}

.serve-item {
	width: 25%;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 24rpx;
}

.serve-icon {
	width: 48rpx;
	height: 48rpx;
}

/* ===== 宫格文字 ===== */
.grid-text {
	margin-top: 16rpx;
	font-size: 24rpx;
	color: #373738;
	text-align: center;
}

/* ===== 弹窗样式 ===== */
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 999;
}

.modal-box {
	width: 560rpx;
	background: #fff;
	border-radius: 24rpx;
	overflow: hidden;
}

.modal-title {
	text-align: center;
	font-size: 32rpx;
	font-weight: 500;
	color: #333;
	padding: 40rpx 32rpx 24rpx;
}

.modal-content {
	padding: 0 32rpx 40rpx;
	font-size: 28rpx;
	color: #666;
	text-align: center;
	line-height: 1.6;
}

.help-content {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	text-align: left;
}

.help-tip {
	color: #a2a2a2;
	margin-bottom: 12rpx;
}

.help-link {
	color: #4caf50;
	word-break: break-all;
	line-height: 1.5;
}

.modal-btns {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 40rpx;
	padding: 30rpx 0;
}

.aaaaa {
	width: 112rpx;
	height: 44rpx;
	background: linear-gradient(90deg, #459767 0%, #52ae7b 100%);
	border-radius: 22rpx 22rpx 22rpx 22rpx;
	margin-left: 30rpx;
	padding-left: 18rpx;
}

.qs {
	width: 100%;
	height: 64rpx;
	background: #ffffff;
	box-shadow: 0rpx 6rpx 12rpx 2rpx rgba(68, 68, 68, 0.12);
	border-radius: 32rpx;
	margin-top: -20rpx;
	margin-bottom: 30rpx;
	display: flex;
	align-items: center;
	padding: 0 24rpx;
	box-sizing: border-box;
}

.qs-icon-left {
	width: 36rpx;
	height: 36rpx;
	flex-shrink: 0;
}

.qs-text {
	flex: 1;
	font-size: 26rpx;
	color: #373738;
	margin-left: 16rpx;
}

.qs-right {
	display: flex;
	align-items: center;
}

.qs-action {
	font-size: 26rpx;
	color: #52ae7b;
}

.qs-icon-right {
	width: 28rpx;
	height: 28rpx;
	margin-left: 4rpx;
}
</style>
