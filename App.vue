<template>
  <!-- #ifdef APP-PLUS -->
  <!-- 全局悬浮字幕：通话期间叠加在所有页面之上 -->
  <view v-if="subtitleVisible && subtitleText" class="subtitle-overlay">
    <view class="subtitle-bar">
      <text class="subtitle-role">{{ subtitleRole === 'doctor' ? '医生' : '患者' }}</text>
      <text
        class="subtitle-text"
        :class="{ 'subtitle-interim': !subtitleFinal }"
      >{{ subtitleText }}</text>
    </view>
  </view>
  <!-- #endif -->
</template>

<script>
// #ifdef APP-PLUS
import { genTestUserSig } from '@/debug/GenerateTestUserSig.js';
import { startVideoRecord, stopVideoRecord, SUBTITLE_WS_HOST } from '@/api/subtitle.js';
import subtitleStore from '@/store/subtitle.js';
// #endif

export default {
  // ── 响应式数据，驱动悬浮字幕 template ─────────────────────────────
  data() {
    return {
      subtitleVisible: false,
      subtitleText:    '',
      subtitleRole:    '',
      subtitleFinal:   false,
    };
  },

  // ── App 生命周期（uni-app Options API，不能用 onMounted）──────────
  onLaunch() {
    // #ifdef APP-PLUS
    this._initCallVars();
    const phone = uni.getStorageSync('phone');
    if (phone) {
      this._initTUICallKit();
    } else {
      // 未登录时监听登录事件，登录成功后再初始化
      uni.$on('userLoggedIn', () => {
        this._initTUICallKit();
      });
    }
    // #endif
  },

  onShow() {},
  onHide() {},

  methods: {
    // #ifdef APP-PLUS

    // ── 初始化通话内部变量（非响应式，挂在实例上）──────────────────
    _initCallVars() {
      this._isInCall        = false;
      this._roomId          = '';
      this._recordId        = null;
      this._myTaskId        = '';
      this._audioWs         = null;   // SocketTask：发送 PCM
      this._subtitleWs      = null;   // SocketTask：接收字幕 JSON
      this._recorderMgr     = null;   // RecorderManager
      this._subtitleWsUrl   = '';
      this._reconnectCount  = 0;
      this._reconnectTimer  = null;
      this._audioFallback   = false;  // 兼容不返回 SocketTask 的平台
    },

    // ── TUICallKit 初始化 ──────────────────────────────────────────
    _initTUICallKit() {
      if (uni.$TUICallKit) {
        // 已有实例（如重复触发 userLoggedIn），直接补注监听器
        this._setupCallListeners(uni.$TUICallKit);
        return;
      }
      try {
        const TUICallKit = uni.requireNativePlugin('TencentCloud-TUICallKit');
        if (!TUICallKit) {
          console.log('[App] TUICallKit 插件未加载');
          return;
        }

        const phone       = uni.getStorageSync('phone') || '';
        const validUserID = String(phone).replace(/[^a-zA-Z0-9_-]/g, '');
        if (!validUserID) {
          console.log('[App] phone 为空，跳过初始化');
          return;
        }

        const { userSig, sdkAppID } = genTestUserSig(validUserID);
        uni.$TUICallKit = TUICallKit;

        TUICallKit.login({
          SDKAppID: sdkAppID,
          userID:   validUserID,
          userSig,
          success: (res) => {
            console.log('[App] TUICallKit 登录成功:', JSON.stringify(res));
            this._setupCallListeners(TUICallKit);
          },
          fail: (err) => {
            console.log('[App] TUICallKit 登录失败:', JSON.stringify(err));
          },
        });

        TUICallKit.setSelfInfo({
          nickName: uni.getStorageSync('userName') || '患者',
          avatar:   '',
          success:  () => {},
          fail:     (err) => { console.log('[App] setSelfInfo 失败:', JSON.stringify(err)); },
        });

      } catch (err) {
        console.log('[App] TUICallKit 初始化异常:', err.message || err);
      }
    },

    // ── 通话事件监听 ───────────────────────────────────────────────
    _setupCallListeners(kit) {
      // 收到来电邀请（被叫端）：尝试提前缓存 roomId
      kit.on('onInvited', (data) => {
        console.log('[App] onInvited:', JSON.stringify(data));
        const rid = data?.roomId || data?.room_id || data?.roomID || '';
        if (rid) this._roomId = String(rid);
      });

      // 通话接通（双方都接听，roomId 此时一定有）
      kit.on('onCallBegin', (data) => {
        console.log('[App] onCallBegin:', JSON.stringify(data));
        const rid = data?.roomId || data?.room_id || data?.roomID || '';
        if (rid) this._roomId = String(rid);
        // 延迟 500ms，等 TRTC 房间完全就绪再启动录制
        setTimeout(() => { this._handleCallBegin(); }, 500);
      });

      // 任意一方挂断
      kit.on('onCallEnd', (data) => {
        console.log('[App] onCallEnd:', JSON.stringify(data));
        this._handleCallEnd();
      });

      // 拨出未接通就取消
      kit.on('onCallCancelled', (data) => {
        console.log('[App] onCallCancelled:', JSON.stringify(data));
        this._handleCallEnd();
      });

      // 对方拒接
      kit.on('onUserReject', (data) => {
        console.log('[App] onUserReject:', JSON.stringify(data));
        this._handleCallEnd();
      });

      // 无人接听超时
      kit.on('onUserNoResponse', (data) => {
        console.log('[App] onUserNoResponse:', JSON.stringify(data));
        this._handleCallEnd();
      });

      kit.on('onError', (err) => {
        console.log('[App] TUICallKit onError:', JSON.stringify(err));
      });

      console.log('[App] 监听器注册完成');
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
      this._syncView();

      const phone    = uni.getStorageSync('phone')           || '';
      const doctorId = uni.getStorageSync('currentDoctorId') || '';
      const orderId  = uni.getStorageSync('currentOrderId')  || '';

      console.log('[App] 通话开始 roomId:', this._roomId, 'phone:', phone);

      if (!this._roomId) {
        console.log('[App] roomId 为空，字幕无法启动');
        this._isInCall       = false;
        subtitleStore.active = false;
        this._syncView();
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

        // 兼容 res.data.data / res.data / res 三种嵌套
        const payload     = res?.data?.data || res?.data || res;
        this._recordId    = payload.recordId;
        this._myTaskId    = payload.userTaskId;
        const audioWsBase = payload.audioWsUrl; // "ws://host/ws/audio/"

        console.log('[App] recordId:', this._recordId, 'userTaskId:', this._myTaskId);

        // 字幕 WS：患者端用手机号做 userId
        this._subtitleWsUrl = `${SUBTITLE_WS_HOST}/ws/subtitle/${this._roomId}/${phone}`;

        // 先连字幕 WS，再连音频 WS（音频连通后再开录音）
        this._connectSubtitleWs();
        this._connectAudioWs(audioWsBase + this._myTaskId);

      } catch (err) {
        console.log('[App] 启动字幕失败:', err.message || JSON.stringify(err));
        this._isInCall       = false;
        subtitleStore.active = false;
        this._syncView();
      }
    },

    // ── 通话结束 ────────────────────────────────────────────────────
    async _handleCallEnd() {
      if (!this._isInCall) return;
      this._isInCall = false;

      this._stopRecorder();

      if (this._audioWs) {
        try { this._audioWs.close(); } catch (_) {}
        this._audioWs = null;
      }

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

      this._roomId        = '';
      this._myTaskId      = '';
      this._audioFallback = false;

      // 延迟 2s 让最后一句字幕看完再隐藏
      setTimeout(() => {
        subtitleStore.active      = false;
        subtitleStore.currentText = '';
        subtitleStore.speakerRole = '';
        subtitleStore.isFinal     = false;
        this._syncView();
      }, 2000);
    },

    // ── 音频 WebSocket（发送 PCM 二进制帧）─────────────────────────
    _connectAudioWs(wsUrl) {
      console.log('[App] 连接音频 WS:', wsUrl);
      try {
        const task = uni.connectSocket({ url: wsUrl, multiple: true });

        if (task && typeof task.onOpen === 'function') {
          // 正常路径：拿到 SocketTask 实例
          this._audioWs = task;
          task.onOpen(() => {
            console.log('[App] 音频 WS 已连接，启动录音');
            this._startRecorder();
          });
          task.onClose(() => {
            console.log('[App] 音频 WS 关闭');
            this._stopRecorder();
          });
          task.onError((err) => {
            console.log('[App] 音频 WS 错误:', JSON.stringify(err));
            this._stopRecorder();
          });
        } else {
          // 降级路径：部分 APP 平台 connectSocket 不返回 SocketTask
          console.log('[App] 音频 WS 降级为全局事件模式');
          this._audioFallback = true;
          uni.onSocketOpen(() => {
            console.log('[App] 音频 WS (降级) 已连接，启动录音');
            this._startRecorder();
          });
          uni.onSocketClose(() => {
            console.log('[App] 音频 WS (降级) 关闭');
            this._stopRecorder();
          });
          uni.onSocketError((err) => {
            console.log('[App] 音频 WS (降级) 错误:', JSON.stringify(err));
            this._stopRecorder();
          });
        }
      } catch (err) {
        console.log('[App] 音频 WS 连接异常:', err.message || err);
      }
    },

    // ── 录音采集（PCM 16kHz 单声道）────────────────────────────────
    _startRecorder() {
      try {
        this._recorderMgr = uni.getRecorderManager();

        this._recorderMgr.onFrameRecorded((res) => {
          if (!res.frameBuffer || res.frameBuffer.byteLength === 0) return;
          try {
            if (this._audioFallback) {
              uni.sendSocketMessage({
                data:    res.frameBuffer,
                success: () => {},
                fail:    (e) => { console.log('[App] 帧发送失败(降级):', JSON.stringify(e)); },
              });
            } else if (this._audioWs) {
              this._audioWs.send({
                data:    res.frameBuffer,
                success: () => {},
                fail:    (e) => { console.log('[App] 帧发送失败:', JSON.stringify(e)); },
              });
            }
          } catch (e) {
            console.log('[App] 帧 send 异常:', e.message || e);
          }
        });

        this._recorderMgr.onStop(()  => { console.log('[App] 录音停止'); });
        this._recorderMgr.onError((e) => { console.log('[App] 录音错误:', JSON.stringify(e)); });

        // PCM 16kHz 单声道，frameSize=1KB ≈ 40ms 一帧，符合文档要求
        this._recorderMgr.start({
          sampleRate:       16000,
          numberOfChannels: 1,
          encodeBitRate:    256000,
          format:           'pcm',
          frameSize:        1,
        });

        console.log('[App] 录音已启动 PCM 16kHz 单声道');
      } catch (err) {
        console.log('[App] 启动录音失败:', err.message || err);
      }
    },

    _stopRecorder() {
      if (this._recorderMgr) {
        try { this._recorderMgr.stop(); } catch (_) {}
        this._recorderMgr = null;
      }
    },

    // ── 字幕 WebSocket（接收字幕 JSON）─────────────────────────────
    _connectSubtitleWs() {
      console.log('[App] 连接字幕 WS:', this._subtitleWsUrl);
      try {
        const task = uni.connectSocket({ url: this._subtitleWsUrl, multiple: true });
        if (!task || typeof task.onOpen !== 'function') {
          console.log('[App] 字幕 WS 不支持 SocketTask，字幕不可用');
          return;
        }
        this._subtitleWs = task;

        task.onOpen(() => {
          console.log('[App] 字幕 WS 已连接');
          this._reconnectCount = 0;
          if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
          }
        });

        task.onMessage((event) => {
          this._handleSubtitleMessage(event.data);
        });

        task.onClose(() => {
          console.log('[App] 字幕 WS 断开');
          if (this._isInCall) this._scheduleReconnect();
        });

        task.onError((err) => {
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

        this._syncView();
      } catch (err) {
        console.log('[App] 字幕解析失败:', err.message, rawData);
      }
    },

    // ── 指数退避重连，最多 5 次 ─────────────────────────────────────
    _scheduleReconnect() {
      if (this._reconnectCount >= 5) {
        console.log('[App] 字幕 WS 已达最大重连次数');
        return;
      }
      const delay = Math.min(1000 * Math.pow(2, this._reconnectCount), 30000);
      this._reconnectCount++;
      console.log(`[App] 字幕 WS 将在 ${delay}ms 后重连（第 ${this._reconnectCount} 次）`);
      this._reconnectTimer = setTimeout(() => {
        if (this._isInCall) this._connectSubtitleWs();
      }, delay);
    },

    _closeSubtitleWs() {
      if (this._reconnectTimer) {
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = null;
      }
      if (this._subtitleWs) {
        try { this._subtitleWs.close(); } catch (_) {}
        this._subtitleWs = null;
      }
      this._reconnectCount = 0;
    },

    // ── 同步 subtitleStore -> data()，驱动 template 渲染 ───────────
    _syncView() {
      this.subtitleVisible = subtitleStore.active;
      this.subtitleText    = subtitleStore.currentText;
      this.subtitleRole    = subtitleStore.speakerRole;
      this.subtitleFinal   = subtitleStore.isFinal;
    },

    // #endif
  },
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

.subtitle-interim {
  border-bottom: 2rpx dashed rgba(255, 255, 255, 0.45);
  padding-bottom: 2rpx;
}
/* #endif */
</style>
