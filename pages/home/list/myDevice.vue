<template>
	<view class="page">
		<view class="container">
			<!-- 设备信息 -->
			<view class="device-info">
				<view class="info-header">
					<text class="info-title">蓝牙设备管理</text>
				</view>
				<view class="info-content">
					<view class="info-item">
						<text class="label">设备名称:</text>
						<text class="value">{{ deviceInfo.name || '未连接' }}</text>
					</view>
					<view class="info-item">
						<text class="label">设备地址:</text>
						<text class="value">{{ deviceInfo.address || '未连接' }}</text>
					</view>
					<view class="info-item">
						<text class="label">连接状态:</text>
						<text class="value" :class="{ 'connected': deviceInfo.connected }">
							{{ deviceInfo.connected ? '已连接' : '未连接' }}
						</text>
					</view>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="button-group">
				<button @click="initBluetooth" class="btn">初始化蓝牙</button>
				<button @click="startScan" class="btn">扫描设备</button>
				<button @click="stopScan" class="btn" :disabled="!isScanning">停止扫描</button>
				<button @click="connectDevice" class="btn" :disabled="!selectedDevice">连接设备</button>
				<button @click="disconnectDevice" class="btn" :disabled="!deviceInfo.connected">断开连接</button>
				<button @click="sendTestData" class="btn" :disabled="!deviceInfo.connected">发送测试数据</button>
				<button @click="readData" class="btn" :disabled="!deviceInfo.connected">读取数据</button>
				<button @click="getStatus" class="btn">获取状态</button>
				<button @click="scanQRCode" class="btn">扫码</button>
			</view>

			<!-- 设备列表 -->
			<view class="device-list" v-if="devices.length > 0">
				<view class="list-title">扫描到的设备:</view>
				<view v-for="(device, index) in devices" :key="index" class="device-item"
					:class="{ 'selected': selectedDevice?.address === device.address }" @click="selectDevice(device)">
					<text class="device-name">{{ device.name || '未知设备' }}</text>
					<text class="device-address">{{ device.address }}</text>
				</view>
			</view>

			<!-- 日志输出 -->
			<view class="log-container">
				<view class="log-title">操作日志:</view>
				<view class="log-content">
					<text v-for="(log, index) in logs" :key="index" class="log-item">{{ log }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onShow, onLoad } from "@dcloudio/uni-app";
// import bluetoothPlugin from "@/nativePlugins/bluetooth-plugin/index.js";

// 设备信息
const deviceInfo = reactive({
	name: '',
	address: '',
	connected: false
});

// 扫描状态
const isScanning = ref(false);

// 设备列表
const devices = ref([]);

// 选中的设备
const selectedDevice = ref(null);

// 操作日志
const logs = ref([]);

// 添加日志
const addLog = (message) => {
	const timestamp = new Date().toLocaleTimeString();
	logs.value.unshift(`[${timestamp}] ${message}`);
	// 限制日志数量
	if (logs.value.length > 20) {
		logs.value = logs.value.slice(0, 20);
	}
};

// 初始化蓝牙
const initBluetooth = async () => {
	try {
		addLog('开始初始化蓝牙...');
		const result = await bluetoothPlugin.init({});
		addLog(`初始化成功: ${JSON.stringify(result)}`);
	} catch (error) {
		addLog(`初始化失败: ${JSON.stringify(error)}`);
	}
};

// 开始扫描
const startScan = async () => {
	try {
		addLog('开始扫描设备...');
		isScanning.value = true;
		devices.value = [];

		const result = await bluetoothPlugin.scan({ scanTime: 5000 });
		addLog(`扫描完成，发现 ${result.devices?.length || 0} 个设备`);

		if (result.devices && result.devices.length > 0) {
			devices.value = result.devices;
		}
	} catch (error) {
		addLog(`扫描失败: ${JSON.stringify(error)}`);
	} finally {
		isScanning.value = false;
	}
};

// 停止扫描
const stopScan = async () => {
	try {
		addLog('停止扫描...');
		const result = await bluetoothPlugin.cancelScan({});
		addLog(`停止扫描成功: ${JSON.stringify(result)}`);
	} catch (error) {
		addLog(`停止扫描失败: ${JSON.stringify(error)}`);
	} finally {
		isScanning.value = false;
	}
};

// 选择设备
const selectDevice = (device) => {
	selectedDevice.value = device;
	addLog(`选中设备: ${device.name || '未知设备'} (${device.address})`);
};

// 连接设备
const connectDevice = async () => {
	if (!selectedDevice.value) {
		addLog('请先选择设备');
		return;
	}

	try {
		addLog(`连接设备: ${selectedDevice.value.name || '未知设备'} (${selectedDevice.value.address})`);
		const result = await bluetoothPlugin.connect({
			address: selectedDevice.value.address
		});
		addLog(`连接成功: ${JSON.stringify(result)}`);

		// 更新设备信息
		deviceInfo.name = selectedDevice.value.name || '未知设备';
		deviceInfo.address = selectedDevice.value.address;
		deviceInfo.connected = true;
	} catch (error) {
		addLog(`连接失败: ${JSON.stringify(error)}`);
	}
};

// 断开连接
const disconnectDevice = async () => {
	try {
		addLog('断开连接...');
		const result = await bluetoothPlugin.disconnect({});
		addLog(`断开连接成功: ${JSON.stringify(result)}`);

		// 更新设备信息
		deviceInfo.name = '';
		deviceInfo.address = '';
		deviceInfo.connected = false;
	} catch (error) {
		addLog(`断开连接失败: ${JSON.stringify(error)}`);
	}
};

// 发送测试数据
const sendTestData = async () => {
	try {
		addLog('发送测试数据...');
		const testData = {
			type: 'test',
			message: 'Hello Bluetooth!'
		};
		const result = await bluetoothPlugin.sendData({
			data: JSON.stringify(testData)
		});
		addLog(`发送数据成功: ${JSON.stringify(result)}`);
	} catch (error) {
		addLog(`发送数据失败: ${JSON.stringify(error)}`);
	}
};

// 读取数据
const readData = async () => {
	try {
		addLog('读取设备数据...');
		const result = await bluetoothPlugin.readData({});
		addLog(`读取数据成功: ${JSON.stringify(result)}`);
	} catch (error) {
		addLog(`读取数据失败: ${JSON.stringify(error)}`);
	}
};

// 获取状态
const getStatus = async () => {
	try {
		addLog('获取设备状态...');
		const result = await bluetoothPlugin.getStatus({});
		addLog(`获取状态成功: ${JSON.stringify(result)}`);
	} catch (error) {
		addLog(`获取状态失败: ${JSON.stringify(error)}`);
	}
};

// 扫码
const scanQRCode = async () => {
	try {
		addLog('开始扫码...');
		const result = await bluetoothPlugin.scanQRCode({});
		addLog(`扫码成功: ${JSON.stringify(result)}`);
	} catch (error) {
		addLog(`扫码失败: ${JSON.stringify(error)}`);
	}
};

// 页面加载时初始化
onLoad(() => {
	addLog('页面加载完成');
});
</script>

<style scoped lang="scss">
.page {
	background-color: #f5f5f5;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

.page-header {
	background-color: #fff;
	padding: 30rpx 0;
	text-align: center;
	border-bottom: 1rpx solid #eee;
	position: sticky;
	top: 0;
	z-index: 100;
}

.page-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.container {
	background-color: #fff;
	border-radius: 12rpx;
	padding: 24rpx;
	margin: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.device-info {
	background-color: #f9f9f9;
	border-radius: 8rpx;
	margin-bottom: 24rpx;
	overflow: hidden;
}

.info-header {
	background-color: #f0f0f0;
	padding: 16rpx;
	border-bottom: 1rpx solid #e0e0e0;
}

.info-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.info-content {
	padding: 16rpx;
}

.info-item {
	display: flex;
	justify-content: space-between;
	margin-bottom: 16rpx;
	align-items: center;
}

.info-item:last-child {
	margin-bottom: 0;
}

.label {
	font-size: 28rpx;
	color: #666;
	flex: 1;
}

.value {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	flex: 2;
	text-align: right;
	word-break: break-all;
}

.value.connected {
	color: #4CAF50;
}

.button-group {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.btn {
	height: 70rpx;
	font-size: 24rpx;
	border-radius: 8rpx;
	line-height: 70rpx;
	text-align: center;
}

.btn:disabled {
	opacity: 0.6;
}

.device-list {
	margin-bottom: 24rpx;
}

.list-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 12rpx;
}

.device-item {
	background-color: #f9f9f9;
	border-radius: 8rpx;
	padding: 16rpx;
	margin-bottom: 12rpx;
	cursor: pointer;
	transition: all 0.3s;
}

.device-item:hover {
	background-color: #f0f0f0;
}

.device-item.selected {
	background-color: #e3f2fd;
	border: 2rpx solid #2196F3;
}

.device-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
	display: block;
	margin-bottom: 4rpx;
}

.device-address {
	font-size: 24rpx;
	color: #666;
}

.log-container {
	background-color: #f9f9f9;
	border-radius: 8rpx;
	padding: 16rpx;
	max-height: 300rpx;
	overflow-y: auto;
	margin-top: 20rpx;
}

.log-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 12rpx;
}

.log-content {
	font-size: 22rpx;
	line-height: 1.5;
}

.log-item {
	display: block;
	margin-bottom: 8rpx;
	color: #666;
	word-break: break-all;
}

/* 响应式调整 */
@media (max-width: 375px) {
	.button-group {
		grid-template-columns: repeat(2, 1fr);
	}

	.btn {
		font-size: 22rpx;
		height: 65rpx;
		line-height: 65rpx;
	}
}
</style>
