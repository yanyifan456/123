<template>
  <!-- #ifdef APP-PLUS -->
  <!-- 全局悬浮字幕：通话期间叠加在所有页面之上 -->
  <view
    v-if="subtitleVisible && subtitleText"
    class="subtitle-overlay"
  >
    <view class="subtitle-bar">
      <text class="subtitle-role">{{ subtitleRole === 'doctor' ? '医生' : '患者' }}</text>
      <text class="subtitle-text" :class="{ 'subtitle-interim': !subtitleFinal }">
        {{ subtitleText }}
      </text>
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup>
// #ifdef APP-PLUS
import { ref } from 'vue';
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { genTestUserSig } from '@/debug/GenerateTestUserSig.js';
import { startVideoRecord, stopVideoRecord, SUBTITLE_WS_HOST } from '@/api/subtitle.js';
import subtitleStore from '@/store/subtitle.js';

// ── 悬浮字幕响应式状态（驱动 template）─────────────────────
// subtitleStore 是普通 reactive 对象，App.vue 的 template 无法直接追踪，
// 所以用独立 ref 来驱动视图，收到消息后手动同步。
const subtitleVisible = ref(false);
const subtitleText    = ref('');
const subtitleRole    = ref('');
const subtitleFinal   = ref(false);

function syncView() {
  subtitleVisible.value = subtitleStore.active;
  subtitleText.value    = subtitleStore.currentText;
  subtitleRole.value    = subtitleStore.speakerRole;
  subtitleFinal.value   = subtitleStore.isFinal;
}

// ── 通话内部状态（普通变量）────────────────────────────────
let isInCall       = false;
let roomId         = '';
let recordId       = null;
let myTaskId       = '';

let audioWs        = null;  // SocketTask — 发送 PCM 音频
let subtitleWs     = null;  // SocketTask — 接收字幕 JSON
let recorderMgr    = null;  // RecorderManager

let subtitleWsUrl  = '';
let reconnectCount = 0;
let reconnectTimer = null;

// ── TUICallKit 初始化 ─────────────────────────────────────
function initTUICallKit() {
  try {
    const TUICallKit = uni.requireNativePlugin('TencentCloud-TUICallKit');
    if (!TUICallKit) {
      console.log('[Subtitle] TUICallKit 插件未加载');
      return;
    }

    const phone = uni.getStorageSync('phone') || '';
    // TUICallKit userID 只允许 a-zA-Z0-9_-
    const validUserID = String(phone).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!validUserID) {
      console.log('[Subtitle] phone 为空，跳过 TUICallKit 初始化');
      return;
    }

    const { userSig, sdkAppID } = genTestUserSig(validUserID);
    uni.$TUICallKit = TUICallKit;

    TUICallKit.login({
      SDKAppID: sdkAppID,
      userID: validUserID,
      userSig,
      success(res) {
        console.log('[Subtitle] TUICallKit 登录成功:', JSON.stringify(res));
        setupCallListeners(TUICallKit);
      },
      fail(err) {
        console.log('[Subtitle] TUICallKit 登录失败:', JSON.stringify(err));
      },
    });

    TUICallKit.setSelfInfo({
      nickName: uni.getStorageSync('userName') || '患者',
      avatar: '',
      success() {},
      fail(err) { console.log('[Subtitle] setSelfInfo 失败:', JSON.stringify(err)); },
    });
  } catch (err) {
    console.log('[Subtitle] TUICallKit 初始化异常:', err.message || err);
  }
}

// ── 通话事件监听 ──────────────────────────────────────────
function setupCallListeners(kit) {
  // 收到来电邀请：提前缓存 roomId（兼容不同字段名）
  kit.on('onInvited', (data) => {
    console.log('[Subtitle] onInvited:', JSON.stringify(data));
    const rid = data?.roomId || data?.room_id || data?.roomID || '';
    if (rid) roomId = String(rid);
  });

  // 通话已接通（双方都接听后触发）
  kit.on('onCallBegin', (data) => {
    console.log('[Subtitle] onCallBegin:', JSON.stringify(data));
    const rid = data?.roomId || data?.room_id || data?.roomID || '';
    if (rid) roomId = String(rid);
    handleCallBegin();
  });

  // 通话结束（主动挂断）
  kit.on('onCallEnd', (data) => {
    console.log('[Subtitle] onCallEnd:', JSON.stringify(data));
    handleCallEnd();
  });

  // 通话被取消（拨出未接通就取消）
  kit.on('onCallCancelled', (data) => {
    console.log('[Subtitle] onCallCancelled:', JSON.stringify(data));
    handleCallEnd();
  });

  // 对方拒接
  kit.on('onUserReject', (data) => {
    console.log('[Subtitle] onUserReject:', JSON.stringify(data));
    handleCallEnd();
  });

  // 无人接听超时
  kit.on('onUserNoResponse', (data) => {
    console.log('[Subtitle] onUserNoResponse:', JSON.stringify(data));
    handleCallEnd();
  });

  kit.on('onError', (err) => {
    console.log('[Subtitle] TUICallKit 错误:', JSON.stringify(err));
  });

  console.log('[Subtitle] TUICallKit 监听器注册完成');
}

// ── 通话开始 ──────────────────────────────────────────────
async function handleCallBegin() {
  if (isInCall) return;
  isInCall = true;

  // 重置字幕状态
  subtitleStore.active      = true;
  subtitleStore.currentText = '';
  subtitleStore.speakerRole = '';
  subtitleStore.isFinal     = false;
  subtitleStore.history     = [];
  syncView();

  const phone    = uni.getStorageSync('phone') || '';
  const doctorId = uni.getStorageSync('currentDoctorId') || '';
  const orderId  = uni.getStorageSync('currentOrderId') || '';

  console.log('[Subtitle] 通话开始 roomId:', roomId, 'phone:', phone, 'doctorId:', doctorId);

  if (!roomId) {
    console.log('[Subtitle] roomId 为空，字幕服务无法启动');
    isInCall = false;
    subtitleStore.active = false;
    syncView();
    return;
  }

  try {
    // 1. 调用后端接口获取 taskId 和 audioWsUrl
    const res = await startVideoRecord({ roomId, userId: phone, doctorId, orderId });
    console.log('[Subtitle] startVideoRecord 响应:', JSON.stringify(res));

    // 兼容 res.data.data / res.data / res 三种结构
    const payload   = res?.data?.data || res?.data || res;
    recordId        = payload.recordId;
    myTaskId        = payload.userTaskId;
    const wsUrlBase = payload.audioWsUrl; // "ws://x.x.x.x:8089/ws/audio/"

    console.log('[Subtitle] recordId:', recordId, 'userTaskId:', myTaskId, 'audioWsUrl:', wsUrlBase);

    // 2. 患者端字幕 WS 用手机号（与 startVideoRecord 的 userId 一致）
    subtitleWsUrl = `${SUBTITLE_WS_HOST}/ws/subtitle/${roomId}/${phone}`;

    // 3. 先连字幕 WS，再连音频 WS（音频 WS 开启后才开始录音）
    connectSubtitleWs();
    connectAudioWs(wsUrlBase + myTaskId);
  } catch (err) {
    console.log('[Subtitle] 启动字幕服务失败:', err.message || JSON.stringify(err));
    isInCall = false;
    subtitleStore.active = false;
    syncView();
  }
}

// ── 通话结束 ──────────────────────────────────────────────
async function handleCallEnd() {
  if (!isInCall) return;
  isInCall = false;

  stopRecorder();

  if (audioWs) {
    try { audioWs.close(); } catch (_) {}
    audioWs = null;
  }

  closeSubtitleWs();

  if (recordId) {
    try {
      await stopVideoRecord(recordId);
      console.log('[Subtitle] 录制已停止');
    } catch (err) {
      console.log('[Subtitle] 停止录制失败:', err.message || err);
    }
    recordId = null;
  }

  roomId   = '';
  myTaskId = '';

  // 延迟 2s 再隐藏，让最后一句字幕能看完
  setTimeout(() => {
    subtitleStore.active      = false;
    subtitleStore.currentText = '';
    subtitleStore.speakerRole = '';
    subtitleStore.isFinal     = false;
    syncView();
  }, 2000);
}

// ── 音频 WebSocket（发送 PCM）────────────────────────────
function connectAudioWs(wsUrl) {
  console.log('[Subtitle] 连接音频 WS:', wsUrl);
  try {
    // multiple: true 确保每次都拿到独立的 SocketTask 对象
    audioWs = uni.connectSocket({ url: wsUrl, multiple: true });

    audioWs.onOpen(() => {
      console.log('[Subtitle] 音频 WS 已连接，开始录音');
      startRecorder();
    });

    audioWs.onClose(() => {
      console.log('[Subtitle] 音频 WS 已关闭');
      stopRecorder();
    });

    audioWs.onError((err) => {
      console.log('[Subtitle] 音频 WS 错误:', JSON.stringify(err));
      stopRecorder();
    });
  } catch (err) {
    console.log('[Subtitle] 音频 WS 连接异常:', err.message || err);
  }
}

// ── 录音采集（PCM 16kHz 单声道）─────────────────────────
function startRecorder() {
  try {
    recorderMgr = uni.getRecorderManager();

    recorderMgr.onFrameRecorded((res) => {
      if (!audioWs || !res.frameBuffer || res.frameBuffer.byteLength === 0) return;
      try {
        audioWs.send({
          data: res.frameBuffer,
          success() {},
          fail(err) { console.log('[Subtitle] 音频帧发送失败:', JSON.stringify(err)); },
        });
      } catch (e) {
        console.log('[Subtitle] 音频帧 send 异常:', e.message || e);
      }
    });

    recorderMgr.onStop(() => {
      console.log('[Subtitle] 录音已停止');
    });

    recorderMgr.onError((err) => {
      console.log('[Subtitle] 录音错误:', JSON.stringify(err));
    });

    // PCM 16kHz 单声道，frameSize=1 KB ≈ 40ms（640 byte）
    recorderMgr.start({
      sampleRate:       16000,
      numberOfChannels: 1,
      encodeBitRate:    256000,
      format:           'pcm',
      frameSize:        1,
    });

    console.log('[Subtitle] 录音已启动 PCM 16kHz 单声道');
  } catch (err) {
    console.log('[Subtitle] 启动录音失败:', err.message || err);
  }
}

function stopRecorder() {
  if (recorderMgr) {
    try { recorderMgr.stop(); } catch (_) {}
    recorderMgr = null;
  }
}

// ── 字幕 WebSocket（接收字幕 JSON）───────────────────────
function connectSubtitleWs() {
  console.log('[Subtitle] 连接字幕 WS:', subtitleWsUrl);
  try {
    subtitleWs = uni.connectSocket({ url: subtitleWsUrl, multiple: true });

    subtitleWs.onOpen(() => {
      console.log('[Subtitle] 字幕 WS 已连接');
      reconnectCount = 0;
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    });

    subtitleWs.onMessage((event) => {
      handleSubtitleMessage(event.data);
    });

    subtitleWs.onClose(() => {
      console.log('[Subtitle] 字幕 WS 断开');
      if (isInCall) scheduleSubtitleReconnect();
    });

    subtitleWs.onError((err) => {
      console.log('[Subtitle] 字幕 WS 错误:', JSON.stringify(err));
    });
  } catch (err) {
    console.log('[Subtitle] 字幕 WS 连接异常:', err.message || err);
  }
}

function handleSubtitleMessage(rawData) {
  try {
    const msg = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    if (!msg || msg.type !== 'text') return;

    const { speakerRole, convertedText, isFinal } = msg;

    subtitleStore.currentText = convertedText || '';
    subtitleStore.speakerRole = speakerRole   || '';
    subtitleStore.isFinal     = !!isFinal;

    if (isFinal && convertedText) {
      subtitleStore.history.push({
        speakerRole,
        text:      convertedText,
        timestamp: msg.timestamp || Date.now(),
      });
      // 最多保留 50 条历史
      if (subtitleStore.history.length > 50) subtitleStore.history.shift();
    }

    // 同步到响应式 ref，驱动 template 重新渲染
    syncView();
  } catch (err) {
    console.log('[Subtitle] 字幕消息解析失败:', err.message, rawData);
  }
}

// 指数退避重连，最多 5 次
function scheduleSubtitleReconnect() {
  if (reconnectCount >= 5) {
    console.log('[Subtitle] 字幕 WS 已达最大重连次数');
    return;
  }
  const delay = Math.min(1000 * Math.pow(2, reconnectCount), 30000);
  reconnectCount++;
  console.log(`[Subtitle] 字幕 WS ${delay}ms 后重连（第 ${reconnectCount} 次）`);
  reconnectTimer = setTimeout(() => {
    if (isInCall) connectSubtitleWs();
  }, delay);
}

function closeSubtitleWs() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  if (subtitleWs) {
    try { subtitleWs.close(); } catch (_) {}
    subtitleWs = null;
  }
  reconnectCount = 0;
}

// ── App 生命周期 ──────────────────────────────────────────
// uni-app 的 App.vue 中用 @dcloudio/uni-app 的 onLaunch，而不是 Vue 的 onMounted
onLaunch(() => {
  console.log('[Subtitle] App onLaunch');
  const phone = uni.getStorageSync('phone');
  if (phone) {
    // 已登录：直接初始化
    initTUICallKit();
  } else {
    // 未登录：等待登录完成后再初始化（登录页调用 uni.$emit('userLoggedIn')）
    uni.$on('userLoggedIn', () => {
      console.log('[Subtitle] 收到 userLoggedIn，初始化 TUICallKit');
      initTUICallKit();
    });
  }
});

onShow(() => {
  console.log('[Subtitle] App onShow');
});

onHide(() => {
  console.log('[Subtitle] App onHide');
});
// #endif
</script>

<!-- Options API block：uni-app 要求 App.vue 必须有 onLaunch 等选项（可为空） -->
<script>
export default {
  onLaunch() {},
  onShow() {},
  onHide() {},
};
</script>

<style lang="scss">
/* 全局公共样式 */
@import "@/styles/index.scss";

/* #ifdef APP-PLUS */
/* ── 全局悬浮字幕 ── */
.subtitle-overlay {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 200rpx;
  z-index: 9999;
  pointer-events: none;
  display: flex;
  justify-content: center;
  padding: 0 40rpx;
  box-sizing: border-box;
}

.subtitle-bar {
  max-width: 90%;
  background-color: rgba(0, 0, 0, 0.68);
  border-radius: 16rpx;
  padding: 16rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.subtitle-role {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 6rpx;
  line-height: 1.3;
}

.subtitle-text {
  font-size: 32rpx;
  color: #ffffff;
  line-height: 1.5;
  word-break: break-all;
}

/* 中间结果：虚线下划线表示"正在说" */
.subtitle-interim {
  border-bottom: 2rpx dashed rgba(255, 255, 255, 0.45);
  padding-bottom: 2rpx;
}
/* #endif */
</style>
