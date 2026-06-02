<template>
	<view class="page">
		<!-- 顶部状态栏 -->
		<view class="header">
			<view class="header-top">
				<view class="status-dot"></view>
				<text class="status-text">{{ orderStatus }}</text>
				<view class="tracking-right">
					<text class="tracking-num">{{ waybillCode }}</text>
					<view class="copy-icon" @click="copyWaybillCode">
						<view class="copy-box"></view>
						<view class="copy-box copy-box--offset"></view>
					</view>
				</view>
			</view>

			<!-- 配送员卡片 -->
			<view class="delivery-card" v-if="collectorName">
				<view class="delivery-left">
					<image class="package-img" src="/static/img/35.png" mode="aspectFit" />
					<view class="delivery-info">
						<text class="delivery-label">预计送达</text>
						<text class="delivery-time">{{ promisetime }}</text>
					</view>
				</view>
				
			</view>
		</view>

		<!-- 详细信息区域 -->
		<view class="detail-section">
			<view class="detail-header">
				<text class="detail-title">详细信息</text>
				<view class="jd-tag">
					<text class="jd-tag-text">京东物流</text>
				</view>
			</view>

			<!-- 收货人信息 -->
			<view class="receiver-info" v-if="reciveUser || reciveAddress || reciveTel">
				<text class="receiver-name-tel">{{ reciveUser }}{{ reciveTel ? ' ' + reciveTel : '' }}</text>
				<text class="receiver-address" v-if="reciveAddress">
					<text class="receiver-address-label">【收货地址】</text>
					{{ reciveAddress }}
				</text>
			</view>

			<!-- 时间线 -->
			<view class="timeline">
				<!-- 接口返回的轨迹节点 -->
				<view
					v-for="(item, index) in trackList"
					:key="'track-' + index"
					:class="['timeline-item', index === trackList.length - 1 && isLastFixed ? '' : 'timeline-item--has-line']"
				>
					<view class="timeline-left">
						<view class="dot dot--active"></view>
						<view class="line" v-if="index < trackList.length - 1 || true"></view>
					</view>
					<view class="timeline-content">
						<text class="timeline-time">{{ item.operationTime }}</text>
						<text class="timeline-desc">
							<text class="place" v-if="item.operateSite">【{{ item.operateSite }}】</text>
							{{ item.operationRemark }}
						</text>
					</view>
				</view>

				<!-- 固定底部节点：始终显示 -->
				<view class="timeline-item">
					<view class="timeline-left">
						<view class="dot dot--active"></view>
						<view class="line"></view>
					</view>
					<view class="timeline-content">
						<text class="timeline-time">{{ shippedTime }}</text>
						<text class="timeline-desc">
							<text class="place">【香港仓库】</text>
							包裹已完成海关清关，正在发往内地
						</text>
						<view class="sub-card sub-card--green">
							<view class="sub-icon sub-icon--green">
								<text class="sub-check">✓</text>
							</view>
							<text class="sub-text sub-text--green">清关完成 · 检验合格</text>
						</view>
					</view>
				</view>

				<view class="timeline-item">
					<view class="timeline-left">
						<view class="dot dot--active"></view>
						<view class="line"></view>
					</view>
					<view class="timeline-content">
						<text class="timeline-time">{{ dispenseTime }}</text>
						<text class="timeline-desc">
							<text class="place">【香港药房】</text>
							药品已完成配药并交付物流
						</text>
						<view class="sub-card sub-card--green">
							<view class="sub-icon sub-icon--green">
								<text class="sub-check">✓</text>
							</view>
							<text class="sub-text sub-text--green">药师复核完成 · 物流打包</text>
						</view>
					</view>
				</view>

				<view class="timeline-item">
					<view class="timeline-left">
						<view class="dot dot--active"></view>
						<view class="line"></view>
					</view>
					<view class="timeline-content">
						<text class="timeline-time">{{ checkTime }}</text>
						<text class="timeline-desc">
							<text class="place">【处方审核】</text>
							香港注册药剂师已审核处方
						</text>
					</view>
				</view>

				<view class="timeline-item timeline-item--last">
					<view class="timeline-left">
						<view class="dot dot--active"></view>
					</view>
					<view class="timeline-content">
						<text class="timeline-time">{{ consultationTime }}</text>
						<text class="timeline-desc">
							<text class="place">【医生开方】</text>
							电子处方已开具
						</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { jdqueryorderdetail } from '@/api/yyf.js';

const tradeId = ref('');
const reciveUser = ref('');
const reciveAddress = ref('');
const reciveTel = ref('');
const shippedTime = ref('');
const dispenseTime = ref('');
const checkTime = ref('');
const consultationTime = ref('');

// 接口数据
const orderStatus = ref('');
const waybillCode = ref('');
const collectorName = ref('');
const collectorPhone = ref('');
const trackList = ref([]);
const promisetime =ref()
const isLastFixed = true;

const copyWaybillCode = () => {
	if (!waybillCode.value) return;
	uni.setClipboardData({
		data: waybillCode.value,
		success: () => {
			uni.showToast({ title: '已复制', icon: 'success' });
		},
		fail: () => {
			uni.showToast({ title: '复制失败', icon: 'none' });
		}
	});
};

const wlxq = async () => {
	const res = await jdqueryorderdetail({ tradeId: tradeId.value });
	console.log(res);
	// res.data.data.data
	if (res.data.code === '1000'){
		const d = res?.data?.data;
		if (!d) return;
		promisetime.value = res.data.promisetime
		checkTime.value= res.data.checkTime
		consultationTime.value= res.data.consultationTime
		
		const traces = d.traceDetails || [];
		
		// 顶部状态取第一条（最新）
		if (traces.length > 0) {
			orderStatus.value = traces[0].categoryName || '';
			waybillCode.value = traces[0].waybillCode || '';
		}
		
		collectorName.value = d.collectorName || '';
		collectorPhone.value = d.collectorPhone || '';
		
		// 过滤掉 operateSite 为 "-1" 的情况
		trackList.value = traces.map(item => ({
			operationTime: item.operationTime || '',
			operateSite: item.operateSite && item.operateSite !== '-1' ? item.operateSite : '',
			operationRemark: item.operationRemark || item.operationTitle || ''
		}));
		console.log(trackList.value);
	}else{
		uni.showToast({
		    title: '暂无物流信息',
		    icon: 'none',
		    duration: 2000
		});
	}
};

onLoad((options) => {
	tradeId.value = options.tradeId || '';
	reciveUser.value = options.reciveUser || '';
	reciveAddress.value = options.reciveAddress || '';
	reciveTel.value = options.reciveTel || '';
	dispenseTime.value = options.dispenseTime || '';
	shippedTime.value = options.shippedTime || '';
	wlxq();
});
</script>

<style scoped lang="scss">
.page {
	min-height: 100vh;
	background-color: #f8f8f8;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
	padding: 48rpx;
}

/* ========== 顶部 Header ========== */
.header {
	background: linear-gradient(180deg, #1a2e5a 0%, #1e3a6e 100%);
	padding: 40rpx 32rpx 36rpx;
	border-radius: 20rpx;
}

.header-top {
	display: flex;
	align-items: center;
	margin-bottom: 32rpx;
}

.status-dot {
	width: 14rpx;
	height: 14rpx;
	border-radius: 50%;
	background-color: #4cd96a;
	margin-right: 10rpx;
	flex-shrink: 0;
}

.status-text {
	color: #ffffff;
	font-size: 26rpx;
	font-weight: 600;
	flex: 1;
}

.tracking-right {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.tracking-num {
	color: rgba(255, 255, 255, 0.75);
	font-size: 22rpx;
}

.copy-icon {
	position: relative;
	width: 24rpx;
	height: 24rpx;
}

.copy-box {
	position: absolute;
	width: 16rpx;
	height: 16rpx;
	border: 2rpx solid rgba(255, 255, 255, 0.6);
	border-radius: 3rpx;
	background: transparent;
}

.copy-box--offset {
	top: 6rpx;
	left: 6rpx;
	background: rgba(30, 58, 110, 0.8);
}

.delivery-card {
	background: rgba(255, 255, 255, 0.12);
	border-radius: 16rpx;
	padding: 24rpx 28rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.delivery-left {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.package-img {
	width: 64rpx;
	height: 64rpx;
}

.delivery-info {
	display: flex;
	flex-direction: column;
}

.delivery-label {
	color: rgba(255, 255, 255, 0.7);
	font-size: 22rpx;
	margin-bottom: 6rpx;
}

.delivery-time {
	color: #ffffff;
	font-size: 34rpx;
	font-weight: 700;
	letter-spacing: 1rpx;
}

.delivery-tag {
	background: rgba(76, 217, 106, 0.2);
	border: 1rpx solid rgba(76, 217, 106, 0.5);
	border-radius: 24rpx;
	padding: 8rpx 20rpx;
}

.delivery-tag-text {
	color: #4cd96a;
	font-size: 24rpx;
	font-weight: 600;
}

/* ========== 详细信息区域 ========== */
.detail-section {
	background: #ffffff;
	margin-top: 16rpx;
	padding: 32rpx;
	min-height: 60vh;
	border-radius: 20rpx;
}

.detail-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 40rpx;
}

.detail-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1a1a1a;
}

.jd-tag {
	background: #fff1e6;
	border-radius: 6rpx;
	padding: 4rpx 12rpx;
}

.jd-tag-text {
	color: #e5672e;
	font-size: 20rpx;
	font-weight: 500;
}

.receiver-info {
	padding: 24rpx 0 36rpx;
	border-bottom: 1rpx solid #f0f0f0;
	margin-bottom: 36rpx;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.receiver-name-tel {
	font-size: 28rpx;
	color: #1a1a1a;
	font-weight: 500;
}

.receiver-address {
	font-size: 26rpx;
	color: #555555;
	line-height: 1.6;
}

.receiver-address-label {
	font-weight: 600;
	color: #1a1a1a;
}

/* ========== 时间线 ========== */
.timeline {
	position: relative;
}

.timeline-item {
	display: flex;
	gap: 24rpx;
	padding-bottom: 48rpx;
	position: relative;
}

.timeline-item--last {
	padding-bottom: 0;
}

.timeline-left {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex-shrink: 0;
	width: 24rpx;
	margin-top: 4rpx;
}

.dot {
	width: 24rpx;
	height: 24rpx;
	border-radius: 50%;
	flex-shrink: 0;
	z-index: 1;
}

.dot--active {
	background-color: #2eb87a;
	box-shadow: 0 0 0 5rpx rgba(46, 184, 122, 0.2);
}

.line {
	width: 2rpx;
	flex: 1;
	background-color: #e0e0e0;
	margin-top: 8rpx;
	min-height: 40rpx;
}

.timeline-content {
	flex: 1;
	padding-bottom: 4rpx;
}

.timeline-time {
	display: block;
	font-size: 22rpx;
	color: #2eb87a;
	margin-bottom: 8rpx;
}

.timeline-desc {
	font-size: 26rpx;
	color: #1a1a1a;
	line-height: 1.6;
}

.place {
	font-weight: 600;
	color: #1a1a1a;
}

.sub-card {
	display: flex;
	align-items: center;
	gap: 12rpx;
	border-radius: 10rpx;
	padding: 14rpx 20rpx;
	margin-top: 16rpx;
}

.sub-card--green {
	background: #f0faf5;
}

.sub-icon {
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.sub-icon--green {
	background: #2eb87a;
}

.sub-check {
	color: #ffffff;
	font-size: 18rpx;
	font-weight: 700;
	line-height: 1;
}

.sub-text--green {
	font-size: 22rpx;
	color: #2eb87a;
}
</style>