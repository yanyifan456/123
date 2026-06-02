<template>
	<view class="chat-container">

		<!-- 消息列表 -->
		<scroll-view class="msg-list" scroll-y :scroll-into-view="scrollToId" :scroll-with-animation="true"
			@scrolltoupper="loadMoreHistory" :upper-threshold="50">
			<view v-if="isLoadingMore" class="loading-tip">
				<text>加载中...</text>
			</view>
			<view v-else-if="!hasMore && messageList.length > 0" class="loading-tip">
				<text>没有更多消息了</text>
			</view>

			<!-- 客服重分配提示 -->
			<view v-if="reassigned" class="system-tip">
				<text>系统提示：您已转接至新客服，请继续咨询</text>
			</view>

			<view v-for="(msg, index) in messageList" :key="msg.id || index" :id="'msg-' + index">
				<!-- 系统消息 -->
				<view v-if="msg.senderType === 'system'" class="system-tip">
					<text>{{ msg.content }}</text>
				</view>

				<!-- 普通聊天消息 -->
				<view v-else class="msg-row">
					<!-- 时间标签 -->
					<view v-if="shouldShowTime(index)" class="time-label">
						<text>{{ formatTime(msg.sendTime) }}</text>
					</view>

					<!-- 左侧：客服消息 -->
					<view v-if="msg.senderType === 'service' || msg.role === 'service'"
						class="msg-content msg-content-left">
						<view class="avatar avatar-service">
							<text class="avatar-text">客服</text>
						</view>
						<view class="bubble bubble-left">
							<text class="bubble-text">{{ msg.content }}</text>
						</view>
					</view>

					<!-- 右侧：用户消息 -->
					<view v-if="msg.senderType === 'user' || msg.role === 'user'" class="msg-content msg-content-right">
						<view class="bubble bubble-right">
							<text class="bubble-text bubble-text-right">{{ msg.content }}</text>
						</view>
						<view class="avatar avatar-user">
							<text class="avatar-text">我</text>
						</view>
					</view>
				</view>
			</view>

			<view id="msg-bottom" style="height: 20rpx;"></view>
		</scroll-view>

		<!-- 底部输入栏 -->
		<view class="input-bar">
			<input class="input-field" v-model="inputContent" placeholder="请输入您要咨询的内容"
				placeholder-class="input-placeholder" :adjust-position="true" confirm-type="send"
				@confirm="sendMessage" />
			<view class="send-btn" @click="sendMessage">
				<image class="send-img" :src="inputContent.trim() ? '/static/img/28.png' : '/static/img/27.png'"
					mode="aspectFit" />
			</view>
		</view>

		<!-- 连接状态提示 -->
		<view v-if="!wsConnected" class="ws-status">
			<text class="ws-status-text">连接已断开，正在重连...</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { getChatHistory, sendChatMessage, connectWebSocket as createWebSocket, aaa } from '@/api/yyf.js';

const userId = ref(uni.getStorageSync("token"));
const serviceId = ref('');
const messageList = ref([]);
const inputContent = ref('');
const socketTask = ref(null);
const wsConnected = ref(false);
const scrollToId = ref('');
const loading = ref(false);
const reconnectTimer = ref(null);
const reconnectCount = ref(0);
const reassigned = ref(false);

// 分页参数
const currentPage = ref(1);
const pageSize = ref(2000);
const hasMore = ref(true);
const isLoadingMore = ref(false);

onMounted(() => {
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	const options = currentPage.options || {};
	console.log('[DEBUG] 页面参数:', options);
	console.log('[DEBUG] 存储的userId:', uni.getStorageSync('userId'));
	console.log('[DEBUG] 存储的token:', uni.getStorageSync('token'));
	userId.value = options.userId || uni.getStorageSync('userId') || uni.getStorageSync('token') || '';
	console.log('[DEBUG] 最终的userId:', userId.value);
	if (!userId.value) {
		uni.showToast({ title: '用户信息异常', icon: 'none' });
		return;
	}
	loadHistory();
	ls();
	connectWS();
});

onUnmounted(() => {
	closeWebSocket();
});

const ls = async () => {
	console.log(666);
	const res = await aaa({});
	if (res.code == '200' && res.data.data === 0) {
		uni.showToast({ title: res.data.message, icon: 'none' });
	}
};

// ==================== 加载历史消息 ====================
const loadHistory = async (isLoadMore = false) => {
	console.log('[DEBUG] 开始加载历史消息，userId:', userId.value, '页码:', currentPage.value);
	if (isLoadMore) {
		isLoadingMore.value = true;
	} else {
		loading.value = true;
	}
	try {
		const res = await getChatHistory({ 
			userId: userId.value,
			currentPage: currentPage.value,
			pageSize: pageSize.value
		});
		console.log('[DEBUG] 历史消息接口返回:', res);
		if (res.code === '200' && res.data) {
			// 检查接口返回的数据结构
			let newData = [];
			let total = 0;
		
			if (Array.isArray(res.data)) {
				// 接口直接返回消息列表
				newData = res.data;
				// 对于一次性返回所有消息的接口，设置 hasMore 为 false
				hasMore.value = false;
			} else if (res.data.data) {
				// 接口返回的数据包含 data 和 total 字段
				newData = res.data.data;
				total = res.data.total || 0;
				// 判断是否还有更多数据
				const loadedCount = messageList.value.length + newData.length;
				hasMore.value = loadedCount < total;
			}
			
			if (isLoadMore) {
				// 加载更多：将新数据添加到列表前面
				messageList.value = [...newData, ...messageList.value];
			} else {
				// 首次加载：直接赋值
				messageList.value = newData;
			}
			
			console.log('[DEBUG] 消息列表长度:', messageList.value.length, '是否还有更多:', hasMore.value);
			
			if (messageList.value.length > 0 && !isLoadMore) {
				const last = messageList.value[messageList.value.length - 1];
				serviceId.value = last.serviceId || '';
				console.log('[DEBUG] 服务ID:', serviceId.value);
				nextTick(() => scrollToBottom());
			} else if (isLoadMore) {
				// 加载更多时，保持当前滚动位置
				nextTick(() => {
					// 计算新增消息的高度，保持滚动位置
					const scrollview = document.querySelector('.msg-list');
					if (scrollview) {
						scrollview.scrollTop = newData.length * 60; // 估算每条消息高度
					}
				});
			}
		} else {
			console.error('[DEBUG] 历史消息接口返回错误:', res);
			hasMore.value = false;
		}
	} catch (e) {
		console.error('加载历史失败', e);
		hasMore.value = false;
	} finally {
		loading.value = false;
		isLoadingMore.value = false;
		console.log('[DEBUG] 加载历史完成');
	}
};

// ==================== 加载更多历史 ====================
const loadMoreHistory = async () => {
	if (!hasMore.value || isLoadingMore.value || loading.value) {
		return;
	}
	currentPage.value++;
	await loadHistory(true);
};

// ==================== 发送消息 ====================
const sendMessage = async () => {
	const content = inputContent.value.trim();
	if (!content) return;

	inputContent.value = '';

	try {
		const res = await sendChatMessage({
			userId: userId.value,
			content: content,
			msgType: 'text'
		});

		if (res.code === '200') {
			const newServiceId = res.data.serviceId;

			if (serviceId.value && newServiceId !== serviceId.value) {
				reassigned.value = true;
				messageList.value.push({
					id: 'sys-' + Date.now(),
					senderType: 'system',
					content: '您已转接至新客服，请继续咨询'
				});
				setTimeout(() => { reassigned.value = false; }, 3000);
			}

			serviceId.value = newServiceId;

			messageList.value.push({
				id: 'local-' + Date.now(),
				senderType: 'user',
				senderId: userId.value,
				content: content,
				msgType: 'text',
				sendTime: new Date().toISOString(),
				userId: userId.value,
				serviceId: serviceId.value
			});

			nextTick(() => scrollToBottom());
		} else {
			uni.showToast({ title: res.msg || '发送失败', icon: 'none' });
			inputContent.value = content;
		}
	} catch (e) {
		console.log(e);
		uni.showToast({ title: '网络异常', icon: 'none' });
		inputContent.value = content;
	}
};

// ==================== WebSocket ====================
const connectWS = () => {
	if (socketTask.value) {
		try { socketTask.value.close(); } catch (e) { }
	}

	console.log('[WS] 开始连接，userId:', userId.value);

	socketTask.value = createWebSocket(
		userId.value,
		() => {
			console.log('[WS] 已连接');
			wsConnected.value = true;
			reconnectCount.value = 0;
			// 连接成功后重新加载历史消息，确保获取最新消息
			// 重置分页参数
			currentPage.value = 1;
			hasMore.value = true;
			messageList.value = [];
			loadHistory();
		},
		(res) => {
			try {
				console.log('[WS] 收到消息:', res.data);
				const msg = JSON.parse(res.data);
				// 检查消息格式是否正确
				if (msg && (msg.senderType || msg.role)) {
					messageList.value.push(msg);
					nextTick(() => scrollToBottom());
				} else {
					console.error('[WS] 消息格式错误:', msg);
				}
			} catch (e) {
				console.error('[WS] 消息解析失败', e);
			}
		},
		() => {
			console.log('[WS] 连接关闭');
			wsConnected.value = false;
			scheduleReconnect();
		},
		(err) => {
			console.error('[WS] 错误', err);
			wsConnected.value = false;
		}
	);
};

const scheduleReconnect = () => {
	if (reconnectTimer.value) clearTimeout(reconnectTimer.value);
	if (reconnectCount.value >= 10) return;
	const delay = Math.min(3000 * Math.pow(1.5, reconnectCount.value), 30000);
	reconnectCount.value++;
	reconnectTimer.value = setTimeout(() => connectWS(), delay);
};

const closeWebSocket = () => {
	if (reconnectTimer.value) clearTimeout(reconnectTimer.value);
	if (socketTask.value) {
		try { socketTask.value.close(); } catch (e) { }
		socketTask.value = null;
	}
};

const scrollToBottom = () => {
	scrollToId.value = '';
	nextTick(() => { scrollToId.value = 'msg-bottom'; });
};

const shouldShowTime = (index) => {
	if (index === 0) return true;
	const prev = messageList.value[index - 1];
	const curr = messageList.value[index];
	if (!prev || !curr || !prev.sendTime || !curr.sendTime) return false;
	try {
		return (new Date(curr.sendTime) - new Date(prev.sendTime)) > 5 * 60 * 1000;
	} catch (e) {
		console.error('[DEBUG] 时间计算错误:', e);
		return false;
	}
};

const formatTime = (timeStr) => {
	if (!timeStr) return '';
	const d = new Date(timeStr);
	const now = new Date();
	const pad = (n) => n.toString().padStart(2, '0');
	const time = pad(d.getHours()) + ':' + pad(d.getMinutes());
	if (d.toDateString() === now.toDateString()) return time;
	return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + time;
};

const goBack = () => {
	uni.navigateBack();
};
</script>

<style scoped>
/* ========== 整体容器 ========== */
.chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #F8F8F8;
}

/* ========== 消息列表 ========== */
.msg-list {
	flex: 1;
	overflow: hidden;
	padding: 20rpx 24rpx;
	box-sizing: border-box;
}

.loading-tip {
	text-align: center;
	padding: 20rpx;
	color: #999;
	font-size: 24rpx;
}

/* ========== 系统提示 ========== */
.system-tip {
	text-align: center;
	padding: 10rpx 40rpx;
	margin: 10rpx 0;
}

.system-tip text {
	color: #aaa;
	font-size: 22rpx;
	background: rgba(0, 0, 0, 0.06);
	padding: 6rpx 22rpx;
	border-radius: 20rpx;
}

/* ========== 时间标签 ========== */
.time-label {
	text-align: center;
	padding: 10rpx 0 18rpx;
}

.time-label text {
	font-size: 22rpx;
	color: #aaa;
}

/* ========== 消息行 ========== */
.msg-row {
	margin-bottom: 28rpx;
}

.msg-content {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	gap: 16rpx;
}

.msg-content-left {
	justify-content: flex-start;
}

.msg-content-right {
	justify-content: flex-end;
}

/* ========== 头像 ========== */
.avatar {
	width: 68rpx;
	height: 68rpx;
	border-radius: 10rpx;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar-service {
	background: linear-gradient(145deg, #8ec8f0 0%, #6ab0e8 100%);
}

.avatar-user {
	background: linear-gradient(145deg, #68c97a 0%, #4dac62 100%);
}

.avatar-text {
	color: #fff;
	font-size: 20rpx;
	font-weight: 600;
}

/* ========== 气泡 ========== */
.bubble {
	max-width: 62%;
	padding: 20rpx 24rpx;
	border-radius: 16rpx;
	word-break: break-all;
}

.bubble-left {
	background: #ffffff;
	border-top-left-radius: 4rpx;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
}

.bubble-right {
	background: #4dac6e;
	border-top-right-radius: 4rpx;
}

.bubble-text {
	font-size: 30rpx;
	line-height: 1.65;
	color: #333;
}

.bubble-text-right {
	color: #ffffff;
}

/* ========== 底部输入栏（固定底部） ========== */
.input-bar {
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 18rpx;
	padding: 16rpx 24rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
	background: #F8F8F8;
}

/* 胶囊形输入框 */
.input-field {
	flex: 1;
	height: 96rpx;
	padding: 0 30rpx;
	background: #ffffff;
	border-radius: 40rpx;
	font-size: 28rpx;
	color: #333;
	line-height: 80rpx;
}

.input-placeholder {
	color: #c0c0c0;
	font-size: 28rpx;
}

/* 发送按钮（图片容器） */
.send-btn {
	width: 80rpx;
	height: 80rpx;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.send-img {
	width: 80rpx;
	height: 80rpx;
}

/* ========== 断线提示 ========== */
.ws-status {
	position: fixed;
	bottom: calc(116rpx + env(safe-area-inset-bottom));
	left: 0;
	right: 0;
	padding: 10rpx;
	background: #fff3cd;
	text-align: center;
	z-index: 100;
}

.ws-status-text {
	font-size: 24rpx;
	color: #856404;
}
</style>