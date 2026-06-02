<template>
	<view class="page pages">
		<!-- <view class="nav-bar" :style="{ paddingTop: statusBarHeight * 2 + 'rpx', height: navTotalHeight + 'rpx' }">
			<view class="nav-content">
				<view class="nav-arrow" @click="goBack">
					<image src="/static/images/arrow-left.png" mode="" class="img-box"></image>
				</view>
				<view class="nav-title">AI助手</view>
			</view>
		</view> -->
		<scroll-view scroll-y="true" class="scroll-box" :scroll-into-view="scrollIntoView" @scroll="onScroll">
			<view class="consult-person">
				<image src="/static/images/consult-person.png" mode="" class="img-box"></image>
			</view>
			<view class="fast-box">
				<view class="fast-title">
					<view class="color-mark"></view>
					<view class="title-text">
						<view class="">你可能想問</view>
						<view class="">Would like to ask</view>
					</view>
				</view>
				<view class="fast-card-list">
					<view
						class="fast-card"
						v-for="(item, index) in fastMsg"
						:key="item.id"
						@click="onFastMsg(item.msg)"
					>
						<view class="">#</view>
						<view class="">{{ item.msg }}</view>
						<view class="">
							<image src="/static/images/arrow-right.png" class="img-box" mode=""></image>
						</view>
					</view>
				</view>
			</view>
			<view class="msg-row">
				<view v-for="(item, index) in messages" :key="index" :class="item.isAi ? 'msg-left' : 'msg-right'">
					{{ item.text }}
				</view>
			</view>
			<view id="bottom-anchor"></view>
		</scroll-view>
		<view class="bottom-box">
			<view class="input-box">
				<input type="text" class="ipt" placeholder="请输入" v-model="textInput" />
				<view class="send-icon" @click="sendMsg">
					<image src="/static/images/send-msg.png" class="img-box" mode=""></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref, computed, nextTick } from "vue";
import { onShow, onLoad, onHide } from "@dcloudio/uni-app";
import { marked } from "marked";

const goBack = () => {
	uni.navigateBack();
};
// 状态栏高度
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight;

// 导航栏内容高度设计图 88rpx
const navContentHeight = 88;
const navTotalHeight = statusBarHeight * 2 + navContentHeight;

// 快捷消息
const fastMsg = ref([
	{ id: 1, msg: "血常規白細胞偏高代表什麼？" },
	{ id: 2, msg: "甲狀腺結節多久複查一次？" },
	{ id: 3, msg: "熬夜後如何調理身體？" },
	{ id: 4, msg: "老人骨質疏鬆該如何補鈣？" },
]);

const onFastMsg = (val) => {
	sendMessage(val);
};

// 消息
const messages = ref([]);
const textInput = ref("");
const isAiLoading = ref(false);
const isInput = computed(() => textInput.value.trim() !== "");
const sendMsg = () => {
	if (!textInput.value.trim()) return;

	sendMessage(textInput.value);
	textInput.value = "";
};
const scrollIntoView = ref("");
let isAutoScrolling = false;
let userScrolling = false;
let userScrollTimer = null;
let scrollTimer = null;
const onScroll = (e) => {
	// 👉 如果是程序触发的滚动，忽略
	if (isAutoScrolling) {
		isAutoScrolling = false;
		return;
	}

	// 👉 用户开始滚动
	userScrolling = true;

	// 👉 停止后恢复自动滚动能力
	if (userScrollTimer) clearTimeout(userScrollTimer);

	userScrollTimer = setTimeout(() => {
		userScrolling = false;
	}, 1000); // 1秒没动，认为用户停止
};
const scrollToBottom = () => {
	if (userScrolling) return;

	if (scrollTimer) return;

	scrollTimer = setTimeout(() => {
		isAutoScrolling = true;

		nextTick(() => {
			scrollIntoView.value = "";
			nextTick(() => {
				scrollIntoView.value = "bottom-anchor";
				scrollTimer = null;
			});
		});
	}, 100);
};
const sendMessage = async (text) => {
	try {
		if (!text) return;

		if (isAiLoading.value) {
			uni.showToast({
				title: "若谷健康小醫正在思考中，請稍等...",
				icon: "none",
			});
			return;
		}

		// 用户消息
		messages.value.push({ text, isAi: false });
		scrollToBottom();

		// AI 占位
		const aiMessage = { text: "若谷健康小醫正在思考中，請稍等...", nodes: [], isAi: true, isLoading: true };
		messages.value.push(aiMessage);
		scrollToBottom();

		isAiLoading.value = true;

		// AI 请求
		const fullText = await messageServe(text);

		await fakeStreamOutput(fullText, (chunk) => {
			const lastIndex = messages.value.length - 1;
			messages.value[lastIndex].text = chunk;
			messages.value[lastIndex].nodes = marked.parse(chunk);
			messages.value[lastIndex].isLoading = true;
			messages.value = [...messages.value];
			if (!userScrolling) {
				scrollToBottom();
			}
		});

		messages.value[messages.value.length - 1].isLoading = false;
		isAiLoading.value = false;
	} catch (error) {
		//TODO handle the exception
		console.log(error);
	} finally {
		messages.value[messages.value.length - 1].isLoading = false;
		isAiLoading.value = false;
	}
};

const SYSTEM_PROMPT = `
你是一个通用智能助手，只代表本产品本身。

【身份与品牌约束】
- 不得以任何形式提及：通义千问、阿里云、Qwen、OpenAI、ChatGPT、AI模型、语言模型等
- 不得解释你的技术原理或模型来源
- 不得说明你是“模型”或“人工智能”

【输出格式强约束】
- 严禁使用任何表情符号、emoji、颜文字（例如：😀、😂、❤️、^_^、:-) 等）
- 只允许使用纯文本中文
- 语气专业、自然、克制

【交互规则】
- 回答应直接、简洁、有条理
- 若遇到无法回答的问题，使用中性说明，不暴露任何系统或模型信息
- 不得主动声明任何限制来源

【违规处理】
- 如果用户询问你的身份或模型来源，统一回答：
  “我是本产品内置的智能助手。”

严格遵守以上规则。
`;

const messageServe = async (content) => {
	try {
		const res = await new Promise((resolve, reject) => {
			uni.request({
				url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
				method: "POST",
				header: {
					Authorization: "Bearer sk-b43ce71224294b00ac7e3bbbaa8a018b",
					"Content-Type": "application/json",
				},
				data: {
					model: "qwen-plus",
					messages: [
						{
							role: "system",
							content: SYSTEM_PROMPT, // 👈 隐藏提示词
						},
						{ role: "user", content },
					],
					stream: false,
				},
				success: resolve,
				fail: reject,
			});
		});

		const text = res.data?.choices?.[0]?.message?.content || "暂无回复";

		// console.log("【AI 完整回复】", text);
		return text;
	} catch (e) {
		console.error("【AI 請求失敗】", e);
		uni.showToast({
			title: "服務異常",
			icon: "none",
		});
		return "服務異常，請稍後再試";
	}
};
const fakeStreamOutput = async (fullText, onChunk) => {
	let currentText = "";
	for (let i = 0; i < fullText.length; i++) {
		currentText += fullText[i];
		onChunk(currentText);
		await new Promise((resolve) => setTimeout(resolve, 30)); // 打字速度
	}
};
</script>

<style scoped lang="scss">
.pages {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background-image: url("/static/images/consult-bg.png");
	background-repeat: no-repeat;
	background-size: 100% 100%;
}
/* 自定义导航栏 */
.nav-bar {
	width: 100%;
	// background-color: #fff;
	display: flex;
	flex-direction: column;
	justify-content: flex-end; /* 内容在状态栏下方 */
	z-index: 10;
	box-sizing: border-box;
}

.nav-content {
	height: 88rpx; /* 设计图导航栏内容高度 */
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 48rpx;
	position: relative;
}
.nav-arrow {
	width: 44rpx;
	height: 44rpx;
	position: absolute;
	left: 48rpx;
	bottom: 50%;
	transform: translateY(50%);
}
.nav-left,
.nav-right {
	font-size: 28rpx;
	color: $text-regular;
}

.nav-title {
	font-size: 32rpx;
	font-weight: 700;
	color: $text-primary;
}
.scroll-box {
	flex: 1;
	box-sizing: border-box;
	// height: 1;
	overflow: hidden;
	padding: 32rpx 48rpx 8rpx;
}
.consult-person {
	width: 100%;
	height: 272rpx;
	position: relative;
	z-index: 7;
}
.fast-box {
	width: 100%;
	min-height: 100rpx;
	border-radius: 20rpx;
	border: 1px solid #fff;
	margin-top: -58rpx;
	box-shadow: $box-shadow;
	position: relative;
	z-index: 11;
	background: rgba(#fff, 0.16);
	backdrop-filter: blur(20rpx);
	padding: 24rpx;
}

.fast-title {
	@include flex-start;
}
.color-mark {
	width: 8rpx;
	height: 48rpx;
	background: linear-gradient(to bottom, rgba($primary, 1), rgba($primary-light, 1));
	border-radius: 4rpx;
	margin-right: 16rpx;
}
.title-text {
	> :nth-child(1) {
		font-size: 28rpx;
		font-weight: 600;
		line-height: 38rpx;
		color: $text-primary;
	}
	> :nth-child(2) {
		font-size: 16rpx;
		font-weight: 400;
		line-height: 22rpx;
		color: $text-secondary;
	}
}
.fast-card-list {
	margin: 24rpx 0;
	.fast-card {
		width: 100%;
		height: 80rpx;
		padding: 24rpx;
		border-radius: 40rpx 40rpx 40rpx 40rpx;
		border: 1rpx solid #fff;
		box-shadow: $box-shadow;
		background: linear-gradient(to bottom, rgba($bg-page, 1), rgba($bg-card, 1));
		margin-bottom: 20rpx;
		@include flex-between;
		> :nth-child(1) {
			flex-shrink: 0;
			width: 32rpx;
			height: 32rpx;
			background: $text-primary;
			border-radius: 12rpx 12rpx 6rpx 12rpx;
			color: $bg-card;
			font-size: 20rpx;
			margin-right: 24rpx;
			@include flex-center;
		}
		> :nth-child(2) {
			flex: 1;
			color: $text-primary;
			font-size: 28rpx;
		}
		> :nth-child(3) {
			width: 32rpx;
			height: 32rpx;
			flex-shrink: 0;
		}
	}
}
.msg-row {
	margin-top: 48rpx;
}
.msg-left {
	width: fit-content;
	min-height: 50rpx;
	background: linear-gradient(to bottom, rgba($bg-page, 1), rgba($bg-card, 1));
	box-shadow: $box-shadow;
	border-radius: 10rpx 40rpx 40rpx 40rpx;
	border: 2rpx solid #ffffff;
	padding: 24rpx;
	margin-right: auto; // 🔥 可加（更规范）
	margin-bottom: 32rpx;
	font-size: 24rpx;
	color: $text-primary;
}
.msg-right {
	width: fit-content;
	min-height: 50rpx;
	background: rgba($primary-light, 1);
	border-radius: 40rpx 10rpx 40rpx 40rpx;
	margin-left: auto;
	margin-bottom: 32rpx;
	padding: 24rpx;
	font-size: 24rpx;
	color: $bg-card;
}

.bottom-box {
	width: 100%;
	height: 200rpx;
	background-image: url("/static/images/bottom-bg.png");
	background-size: 100% 100%;
	background-repeat: no-repeat;
	padding: 16rpx 48rpx;
}
.input-box {
	width: 100%;
	height: 96rpx;
	background: linear-gradient(to bottom, rgba($bg-page, 1), rgba($bg-card, 1));
	border: 2rpx solid #ffffff;
	border-radius: 48rpx;
	box-shadow: $box-shadow;
	padding: 24rpx;
	// color: $text-secondary;
	position: relative;
}
.ipt {
	width: calc(100% - 50rpx);
	height: 100%;
	color: $text-secondary;
	font-size: 28rpx;
}
.send-icon {
	width: 48rpx;
	height: 48rpx;
	position: absolute;
	right: 24rpx;
	top: 50%;
	transform: translateY(-50%);
}
</style>
