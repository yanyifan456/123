<template>
  <!-- #ifdef APP-PLUS -->
  <view>
    <!-- 全局悬浮字幕层：通话中显示 -->
    <view
      v-if="subtitleStore.active && subtitleStore.currentText"
      class="subtitle-overlay"
    >
      <view class="subtitle-bar">
        <text class="subtitle-role">
          {{ subtitleStore.speakerRole === 'doctor' ? '医生' : '患者' }}
        </text>
        <text
          class="subtitle-text"
          :class="{ 'subtitle-interim': !subtitleStore.isFinal }"
        >
          {{ subtitleStore.currentText }}
        </text>
      </view>
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup>
// #ifdef APP-PLUS
import { ref, onMounted, onUnmounted } from 'vue';
import subtitleStore from '@/store/subtitle.js';
import { startVideoRecord, stopVideoRecord, SUBTITLE_WS_HOST } from '@/api/subtitle.js';
import { genTestUserSig } from '@/debug/GenerateTestUserSig.js';

// ─── 内部状态（不需要响应式，用普通变量）───
let isInCall = false;
let roomId = '';
let recordId = null;
let myTaskId = '';

let audioWs = null;       // 音频流 SocketTask
let subtitleWs = null;    // 字幕 SocketTask
let recorderManager = null;
let subtitleWsUrl = '';
let reconnectCount = 0;
let reconnectTimer = null;

// ─── TUICallKit 初始化 ───────────────────────
const initTUICallKit = () => {
  try {
    const TUICallKit = uni.requireNativePlugin('TencentCloud-TUICallKit');
    if (!TUICallKit) {
      console.log('[v0] TUICallKit 插件加载失败');
      return;
    }

    const phone = uni.getStorageSync('phone');
    const validUserID = String(phone || '').replace(/[^a-zA-Z0-9_-]/g, '');
    const { userSig, sdkAppID } = genTestUserSig(validUserID);

    uni.$TUICallKit = TUICallKit;

    TUICallKit.login({
      SDKAppID: sdkAppID,
      userID: validUserID,
      userSig,
      success: (res) => {
        console.log('[v0] TUICallKit 登录成功:', res);
        setupCallListeners();
      },
      fail: (err) => {
        console.log('[v0] TUICallKit 登录失败:', JSON.stringify(err));
        uni.showToast({ title: '通话服务登录失败', icon: 'none' });
      },
    });

    TUICallKit.setSelfInfo({
      nickName: uni.getStorageSync('userName') || '患者',
      avatar: '',
      success: () => {},
      fail: (err) => console.log('[v0] setSelfInfo 失败:', JSON.stringify(err)),
    });
  } catch (err) {
    console.log('[v0] TUICallKit 初始化异常:', err.message || err);
  }
};

// ─── 通话事件监听 ────────────────────────────
const setupCallListeners = () => {
  const kit = uni.$TUICallKit;

  // 收到来电：提前存 roomId（TUICallKit 原生插件事件名）
  kit.on('onInvited', (data) => {
    console.log('[v0] 收到来电邀请:', JSON.stringify(data));
    if (data && data.roomId) {
      roomId = String(data.roomId);
    }
  });

  // 通话开始（APP 端接通后触发）
  kit.on('onCallBegin', (data) => {
    console.log('[v0] 通话开始:', JSON.stringify(data));
    if (data && data.roomId) {
      roomId = String(data.roomId);
    }
    onCallBegin();
  });

  // 通话结束
  kit.on('onCallEnd', (data) => {
    console.log('[v0] 通话结束:', JSON.stringify(data));
    onCallEnd();
  });

  // 通话被取消/拒绝/超时未接
  kit.on('onCallCancelled', (data) => {
    console.log('[v0] 通话被取消:', JSON.stringify(data));
    onCallEnd();
  });

  kit.on('onError', (err) => {
    console.log('[v0] TUICallKit 错误:', JSON.stringify(err));
  });

  console.log('[v0] TUICallKit 监听器设置完成');
};

// ─── 通话开始处理 ─────────────────────────────
const onCallBegin = async () => {
  if (isInCall) return;
  isInCall = true;
  subtitleStore.active = true;
  subtitleStore.currentText = '';
  subtitleStore.history = [];

  const phone = uni.getStorageSync('phone');
  const doctorId = uni.getStorageSync('currentDoctorId') || '';
  const orderId = uni.getStorageSync('currentOrderId') || '';

  if (!roomId) {
    console.log('[v0] 通话开始时 roomId 为空，无法启动字幕');
    // 仍然标记 isInCall，等 roomId 更新后重试
    isInCall = false;
    subtitleStore.active = false;
    return;
  }

  try {
    // 1. 调用后端 /video/record/start 获取 taskId
    const res = await startVideoRecord({
      roomId,
      userId: phone,
      doctorId,
      orderId,
    });

    console.log('[v0] startVideoRecord 响应:', JSON.stringify(res));

    const data = res.data || res;
    recordId = data.recordId;
    myTaskId = data.userTaskId;
    const audioWsUrl = data.audioWsUrl;

    console.log('[v0] recordId:', recordId, 'userTaskId:', myTaskId, 'audioWsUrl:', audioWsUrl);

    // 2. 患者端字幕 WS 用手机号
    subtitleWsUrl = `${SUBTITLE_WS_HOST}/ws/subtitle/${roomId}/${phone}`;

    // 3. 先连接字幕 WS
    connectSubtitleWs();

    // 4. 再连接音频 WS（连接成功后自动开始录音）
    connectAudioWs(audioWsUrl + myTaskId);
  } catch (err) {
    console.log('[v0] 通话开始处理失败:', err.message || JSON.stringify(err));
    isInCall = false;
    subtitleStore.active = false;
  }
};

// ─── 通话结束处理 ─────────────────────────────
const onCallEnd = async () => {
  if (!isInCall) return;
  isInCall = false;

  stopRecorder();

  // 关闭音频 WS（后端自动停止 ASR）
  if (audioWs) {
    try { audioWs.close(); } catch (_) {}
    audioWs = null;
  }

  closeSubtitleWs();

  if (recordId) {
    try {
      await stopVideoRecord(recordId);
      console.log('[v0] 录制已停止');
    } catch (err) {
      console.log('[v0] 停止录制失败:', err.message || err);
    }
    recordId = null;
  }

  // 延迟隐藏字幕
  setTimeout(() => {
    subtitleStore.active = false;
    subtitleStore.currentText = '';
    subtitleStore.speakerRole = '';
    subtitleStore.isFinal = false;
  }, 2000);
};

// ─── 音频采集 ─────────────────────────────────

const connectAudioWs = (wsUrl) => {
  console.log('[v0] 连接音频 WS:', wsUrl);
  try {
    audioWs = uni.connectSocket({
      url: wsUrl,
      success: () => {},
      fail: (err) => console.log('[v0] 音频 WS 连接失败:', JSON.stringify(err)),
    });

    audioWs.onOpen(() => {
      console.log('[v0] 音频 WS 已连接，开始录音');
      startRecorder();
    });

    audioWs.onClose(() => {
      console.log('[v0] 音频 WS 已关闭');
      stopRecorder();
    });

    audioWs.onError((err) => {
      console.log('[v0] 音频 WS 错误:', JSON.stringify(err));
      stopRecorder();
    });
  } catch (err) {
    console.log('[v0] 音频 WS 连接异常:', err.message || err);
  }
};

const startRecorder = () => {
  try {
    recorderManager = uni.getRecorderManager();

    recorderManager.onFrameRecorded((res) => {
      if (audioWs && res.frameBuffer && res.frameBuffer.byteLength > 0) {
        try {
          audioWs.send({
            data: res.frameBuffer,
            success: () => {},
            fail: (err) => console.log('[v0] 音频帧发送失败:', JSON.stringify(err)),
          });
        } catch (e) {
          console.log('[v0] 音频帧 send 异常:', e.message || e);
        }
      }
    });

    recorderManager.onStop(() => {
      console.log('[v0] 录音已停止');
    });

    recorderManager.onError((err) => {
      console.log('[v0] 录音错误:', JSON.stringify(err));
    });

    // PCM 16kHz 单声道，frameSize=1KB ≈ 40ms
    recorderManager.start({
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 256000,
      format: 'pcm',
      frameSize: 1,
    });

    console.log('[v0] 录音已启动 (PCM 16kHz 单声道)');
  } catch (err) {
    console.log('[v0] 启动录音失败:', err.message || err);
  }
};

const stopRecorder = () => {
  if (recorderManager) {
    try { recorderManager.stop(); } catch (_) {}
    recorderManager = null;
  }
};

// ─── 字幕 WebSocket ───────────────────────────

const connectSubtitleWs = () => {
  console.log('[v0] 连接字幕 WS:', subtitleWsUrl);
  try {
    subtitleWs = uni.connectSocket({
      url: subtitleWsUrl,
      success: () => {},
      fail: (err) => console.log('[v0] 字幕 WS 连接失败:', JSON.stringify(err)),
    });

    subtitleWs.onOpen(() => {
      console.log('[v0] 字幕 WS 已连接');
      reconnectCount = 0;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    });

    subtitleWs.onMessage((event) => {
      handleSubtitleMessage(event.data);
    });

    subtitleWs.onClose(() => {
      console.log('[v0] 字幕 WS 断开');
      if (isInCall) {
        scheduleSubtitleReconnect();
      }
    });

    subtitleWs.onError((err) => {
      console.log('[v0] 字幕 WS 错误:', JSON.stringify(err));
    });
  } catch (err) {
    console.log('[v0] 字幕 WS 连接异常:', err.message || err);
  }
};

const handleSubtitleMessage = (rawData) => {
  try {
    const msg = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    if (!msg || msg.type !== 'text') return;

    const { speakerRole, convertedText, isFinal } = msg;

    subtitleStore.currentText = convertedText || '';
    subtitleStore.speakerRole = speakerRole || '';
    subtitleStore.isFinal = !!isFinal;

    if (isFinal) {
      subtitleStore.history.push({
        speakerRole,
        text: convertedText,
        timestamp: msg.timestamp || Date.now(),
      });
      // 最多保留 50 条历史
      if (subtitleStore.history.length > 50) {
        subtitleStore.history.shift();
      }
    }
  } catch (err) {
    console.log('[v0] 字幕消息解析失败:', err.message, rawData);
  }
};

// 指数退避重连，最多 5 次
const scheduleSubtitleReconnect = () => {
  if (reconnectCount >= 5) {
    console.log('[v0] 字幕 WS 已达最大重连次数');
    return;
  }
  const delay = Math.min(1000 * Math.pow(2, reconnectCount), 30000);
  reconnectCount++;
  console.log(`[v0] 字幕 WS 将在 ${delay}ms 后重连（第 ${reconnectCount} 次）`);
  reconnectTimer = setTimeout(() => {
    if (isInCall) connectSubtitleWs();
  }, delay);
};

const closeSubtitleWs = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (subtitleWs) {
    try { subtitleWs.close(); } catch (_) {}
    subtitleWs = null;
  }
  reconnectCount = 0;
};

// ─── 生命周期 ─────────────────────────────────
onMounted(() => {
  initTUICallKit();
});

onUnmounted(() => {
  onCallEnd();
});
// #endif
</script>

<!-- App 全局生命周期（uni-app 要求用 Options API 的 onLaunch 等钩子） -->
<script>
export default {
  onLaunch() {
    console.log('[v0] App Launch');
  },
  onShow() {
    console.log('[v0] App Show');
  },
  onHide() {
    console.log('[v0] App Hide');
  },
};
</script>

<style lang="scss">
/* 每个页面公共 CSS */
@import "@/styles/index.scss";

/* #ifdef APP-PLUS */
/* ─── 全局悬浮字幕 ─── */
.subtitle-overlay {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 180rpx;
  z-index: 9999;
  pointer-events: none;
  display: flex;
  justify-content: center;
  padding: 0 40rpx;
}

.subtitle-bar {
  max-width: 90%;
  background-color: rgba(0, 0, 0, 0.65);
  border-radius: 16rpx;
  padding: 14rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.subtitle-role {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6rpx;
  line-height: 1.2;
}

.subtitle-text {
  font-size: 32rpx;
  color: #ffffff;
  line-height: 1.5;
  word-break: break-all;
}

/* 中间结果：底部虚线表示"正在说" */
.subtitle-interim {
  border-bottom: 2rpx dashed rgba(255, 255, 255, 0.5);
  padding-bottom: 2rpx;
}
/* #endif */
</style>
