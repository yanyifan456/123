<template>
  <!-- #ifdef APP-PLUS -->
  <!-- 全局悬浮字幕：通话期间叠加在所有页面之上 -->
  <view v-if="subtitleStore.active" class="subtitle-overlay" :style="subtitleStyle">
    <view class="subtitle-bar">
      <text class="subtitle-role">{{ subtitleStore.speakerRole === 'doctor' ? '医生' : '患者' }}</text>
      <text class="subtitle-text" :class="{ 'subtitle-interim': !subtitleStore.isFinal }">
        {{ subtitleStore.currentText }}
      </text>
    </view>
  </view>
  <!-- #endif -->
</template>

<script>
// #ifdef APP-PLUS
import subtitleStore from '@/store/subtitle.js';
import { startVideoRecord, stopVideoRecord, SUBTITLE_WS_HOST } from '@/api/subtitle.js';
import { genTestUserSig } from '@/debug/GenerateTestUserSig.js';
// #endif

export default {
  // #ifdef APP-PLUS
  data() {
    return {
      subtitleStore,
      subtitleStyle: {
        bottom: '180rpx',
      },
    };
  },
  // #endif

  onLaunch() {
    console.log('App Launch');
    // #ifdef APP-PLUS
    this._isInCall               = false;
    this._roomId                 = '';
    this._recordId               = null;
    this._subtitleWs             = null;
    this._subtitleWsUrl          = '';
    this._subtitleReconnectTimer = null;
    this._subtitleReconnectCount = 0;

    this._initTUICallKit();
    // #endif
  },

  onShow() {},
  onHide() {},

  // #ifdef APP-PLUS
  methods: {
    // ── TUICallKit 初始化 ──────────────────────────────────────────
    _initTUICallKit() {
      try {
        const TUICallKit = uni.requireNativePlugin('TencentCloud-TUICallKit');
        if (!TUICallKit) throw new Error('插件未加载成功');

        const phone       = uni.getStorageSync('phone');
        const validUserID = String(phone).replace(/[^a-zA-Z0-9_-]/g, '');
        const { userSig, sdkAppID } = genTestUserSig(validUserID);

        uni.$TUICallKit = TUICallKit;

        TUICallKit.login(
          { SDKAppID: sdkAppID, userID: validUserID, userSig },
          (res) => {
            if (res && res.code === 0) {
              console.log('[App] TUICallKit 登录成功');
              this._setupCallListeners();
            } else {
              console.log('[App] TUICallKit 登录失败:', JSON.stringify(res));
            }
          }
        );

        TUICallKit.setSelfInfo(
          { nickName: uni.getStorageSync('userName') || '患者', avatar: '' },
          (res) => {
            if (res && res.code !== 0) console.log('[App] setSelfInfo 失败:', JSON.stringify(res));
          }
        );
      } catch (err) {
        console.log('[App] TUICallKit 初始化失败:', err.message || err);
      }
    },

    // ── 通话事件监听（旧版原生插件通过 globalEvent 抛出事件）────────
    _setupCallListeners() {
      const globalEvent = uni.requireNativePlugin('globalEvent');
      if (!globalEvent) {
        console.log('[App] globalEvent 插件未加载，事件监听不可用');
        return;
      }

      globalEvent.addEventListener('onCallReceived', (res) => {
        console.log('[App] onCallReceived:', JSON.stringify(res));
        if (res && res.callerId) {
          uni.setStorageSync('currentDoctorId', res.callerId);
        }
      });

      globalEvent.addEventListener('onCallBegin', (res) => {
        console.log('[App] onCallBegin:', JSON.stringify(res));
        const rid = res && (res.roomID || res.roomId || res.room_id);
        if (rid) this._roomId = String(rid);
        setTimeout(() => { this._handleCallBegin(); }, 500);
      });

      globalEvent.addEventListener('onCallEnd', (res) => {
        console.log('[App] onCallEnd:', JSON.stringify(res));
        this._handleCallEnd();
      });

      globalEvent.addEventListener('onCallCancelled', (res) => {
        console.log('[App] onCallCancelled:', JSON.stringify(res));
        this._handleCallEnd();
      });

      globalEvent.addEventListener('onUserReject', (res) => {
        console.log('[App] onUserReject:', JSON.stringify(res));
        this._handleCallEnd();
      });

      globalEvent.addEventListener('onUserNoResponse', (res) => {
        console.log('[App] onUserNoResponse:', JSON.stringify(res));
        this._handleCallEnd();
      });

      globalEvent.addEventListener('onError', (res) => {
        console.log('[App] TUICallKit onError:', JSON.stringify(res));
      });

      console.log('[App] globalEvent 监听器注册完成');
    },

    // ── 通话开始 ────────────────────────────────────────────────────
    async _handleCallBegin() {
      if (this._isInCall) return;
      this._isInCall = true;

      subtitleStore.active      = true;
      subtitleStore.currentText = '';
      subtitleStore.speakerRole = '';
      subtitleStore.isFinal     = false;
      subtitleStore.history     = [];

      const phone    = uni.getStorageSync('phone')           || '';
      const doctorId = uni.getStorageSync('currentDoctorId') || '';
      const orderId  = uni.getStorageSync('currentOrderId')  || '';

      console.log('[App] 通话开始 roomId:', this._roomId, 'phone:', phone, 'doctorId:', doctorId);

      if (!this._roomId) {
        console.log('[App] roomId 为空，字幕无法启动');
        this._isInCall       = false;
        subtitleStore.active = false;
        return;
      }

      try {
        const res = await startVideoRecord({
          roomId:   this._roomId,
          userId:   phone,
          doctorId,
          orderId,
        });
        console.log('[App] startVideoRecord 响应:', JSON.stringify(res));

        const data     = res.data || {};
        this._recordId = data.recordId || null;

        console.log('[App] recordId:', this._recordId);

        // 连接字幕 WS
        this._subtitleWsUrl = `${SUBTITLE_WS_HOST}/ws/subtitle/${this._roomId}/${phone}`;
        this._connectSubtitleWs();

      } catch (err) {
        console.log('[App] 启动字幕失败:', err.message || err);
        this._isInCall       = false;
        subtitleStore.active = false;
      }
    },

    // ── 通话结束 ────────────────────────────────────────────────────
    async _handleCallEnd() {
      if (!this._isInCall) return;
      this._isInCall = false;

      this._closeSubtitleWs();

      if (this._recordId) {
        try {
          await stopVideoRecord(this._recordId);
          console.log('[App] 录制已停止');
        } catch (err) {
          console.log('[App] 停止录制失败:', err.message || err);
        }
        this._recordId = null;
      }

      this._roomId = '';

      setTimeout(() => {
        subtitleStore.active      = false;
        subtitleStore.currentText = '';
        subtitleStore.speakerRole = '';
        subtitleStore.isFinal     = false;
      }, 2000);
    },

    // ── 字幕 WebSocket（接收字幕 JSON）─────────────────────────────
    _connectSubtitleWs() {
      console.log('[App] 连接字幕 WS:', this._subtitleWsUrl);
      this._closeSubtitleWs();
      try {
        const socketTask = uni.connectSocket({
          url:     this._subtitleWsUrl,
          success: () => console.log('[App] 字幕 WS 连接中...'),
          fail:    (err) => console.log('[App] 字幕 WS 发起失败:', JSON.stringify(err)),
        });

        this._subtitleWs = socketTask;

        socketTask.onOpen(() => {
          console.log('[App] 字幕 WS 已连接');
          this._subtitleReconnectCount = 0;
          if (this._subtitleReconnectTimer) {
            clearTimeout(this._subtitleReconnectTimer);
            this._subtitleReconnectTimer = null;
          }
        });

        // FIX 2：调用 _handleSubtitleMessage 解析并显示字幕
        socketTask.onMessage((event) => {
          this._handleSubtitleMessage(event.data);
        });

        // FIX 3：断线后触发重连逻辑
        socketTask.onClose(() => {
          console.log('[App] 字幕 WS 断开');
          this._subtitleWs = null;
          if (this._isInCall) {
            this._scheduleSubtitleReconnect();
          }
        });

        socketTask.onError((err) => {
          console.log('[App] 字幕 WS 错误:', JSON.stringify(err));
        });

      } catch (err) {
        console.log('[App] 字幕 WS 连接异常:', err.message || err);
      }
    },

    // ── 字幕消息解析 ────────────────────────────────────────────────
    _handleSubtitleMessage(rawData) {
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
          if (subtitleStore.history.length > 50) subtitleStore.history.shift();
        }
      } catch (err) {
        console.log('[App] 字幕解析失败:', err.message, rawData);
      }
    },

    // ── 指数退避重连，最多 5 次 ─────────────────────────────────────
    _scheduleSubtitleReconnect() {
      if (this._subtitleReconnectCount >= 5) {
        console.log('[App] 字幕 WS 已达最大重连次数');
        return;
      }
      const delay = Math.min(1000 * Math.pow(2, this._subtitleReconnectCount), 30000);
      this._subtitleReconnectCount++;
      console.log(`[App] 字幕 WS 将在 ${delay}ms 后重连（第 ${this._subtitleReconnectCount} 次）`);
      this._subtitleReconnectTimer = setTimeout(() => {
        if (this._isInCall) this._connectSubtitleWs();
      }, delay);
    },

    _closeSubtitleWs() {
      if (this._subtitleReconnectTimer) {
        clearTimeout(this._subtitleReconnectTimer);
        this._subtitleReconnectTimer = null;
      }
      if (this._subtitleWs) {
        // FIX 4：SocketTask.close() 不接受参数，去掉 (1000, 'call ended')
        try { this._subtitleWs.close(); } catch (_) {}
        this._subtitleWs = null;
      }
      this._subtitleReconnectCount = 0;
    },
  },
  // #endif
};
</script>

<style lang="scss">
/* 全局公共样式 */
@import "@/styles/index.scss";

/* #ifdef APP-PLUS */
.subtitle-overlay {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: flex-end;
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

.subtitle-interim {
  border-bottom: 2rpx dashed rgba(255, 255, 255, 0.45);
  padding-bottom: 2rpx;
}
/* #endif */
</style>
