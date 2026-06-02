<template>
  <!-- #ifdef APP-PLUS -->
  <!-- 全局悬浮字幕：通话期间叠加在所有页面之上 -->
  <view v-if="subtitleVisible && subtitleText" class="subtitle-overlay">
    <view class="subtitle-bar">
      <view class="subtitle-header">
        <text class="subtitle-role">{{ subtitleRole === 'doctor' ? '医生' : '患者' }}</text>
        <text class="subtitle-lang">{{ subtitleLangLabel }}</text>
      </view>
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
      subtitleVisible:   false,
      subtitleText:      '',
      subtitleRole:      '',
      subtitleFinal:     false,
      subtitleLangLabel: '',   // 'zh-CN' → '简体' / 'zh-TW' → '繁體' / 'en' → 'EN'
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
        console.log('[App] TUICallKit 已初始化，跳过');
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

        // 旧版原生插件 login：两个独立参数 (options, callback)
        TUICallKit.login(
          { SDKAppID: sdkAppID, userID: validUserID, userSig },
          (res) => {
            if (res.code === 0) {
              console.log('[App] TUICallKit 登录成功');
              // 登录成功后再注册事件监听（globalEvent 需要插件已加载）
              this._setupCallListeners();
            } else {
              console.log('[App] TUICallKit 登录失败:', JSON.stringify(res));
            }
          }
        );

        TUICallKit.setSelfInfo(
          { nickName: uni.getStorageSync('userName') || '患者', avatar: '' },
          (res) => {
            if (res.code !== 0) console.log('[App] setSelfInfo 失败:', JSON.stringify(res));
          }
        );

      } catch (err) {
        console.log('[App] TUICallKit 初始化异常:', err.message || err);
      }
    },

    // ── 通话事件监听（旧版原生插件通过 globalEvent 抛出事件）────────
    // 文档：https://cloud.tencent.com/document/product/647/78764
    _setupCallListeners() {
      try {
        // globalEvent 是 uni-app 原生插件抛出事件的标准方式
        const TUICallKitEvent = uni.requireNativePlugin('globalEvent');
        if (!TUICallKitEvent) {
          console.log('[App] globalEvent 插件未加载，事件监听不可用');
          return;
        }

        // 收到来电邀请（被叫端）
        // res.callerId = 医生的 TUI userID，暂存供 startVideoRecord 使用
        TUICallKitEvent.addEventListener('onCallReceived', (res) => {
          console.log('[App] onCallReceived:', JSON.stringify(res));
          if (res?.callerId) {
            uni.setStorageSync('currentDoctorId', res.callerId);
          }
        });

        // 通话接通：res.roomID 是本次通话的音视频房间 ID
        TUICallKitEvent.addEventListener('onCallBegin', (res) => {
          console.log('[App] onCallBegin:', JSON.stringify(res));
          // 文档字段：res.roomID（Number）
          const rid = res?.roomID || res?.roomId || res?.room_id || '';
          if (rid) this._roomId = String(rid);
          setTimeout(() => { this._handleCallBegin(); }, 500);
        });

        // 通话结束：res.roomID / res.totalTime
        TUICallKitEvent.addEventListener('onCallEnd', (res) => {
          console.log('[App] onCallEnd:', JSON.stringify(res));
          this._handleCallEnd();
        });

        // 通话取消（主叫取消 / 超时 / 拒接）
        TUICallKitEvent.addEventListener('onCallCancelled', (res) => {
          console.log('[App] onCallCancelled:', JSON.stringify(res));
          this._handleCallEnd();
        });

        // 对方拒接
        TUICallKitEvent.addEventListener('onUserReject', (res) => {
          console.log('[App] onUserReject:', JSON.stringify(res));
          this._handleCallEnd();
        });

        // 无人接听超时
        TUICallKitEvent.addEventListener('onUserNoResponse', (res) => {
          console.log('[App] onUserNoResponse:', JSON.stringify(res));
          this._handleCallEnd();
        });

        TUICallKitEvent.addEventListener('onError', (res) => {
          console.log('[App] TUICallKit onError:', JSON.stringify(res));
        });

        console.log('[App] globalEvent 监听器注册完成');
      } catch (err) {
        console.log('[App] 注册事件监听异常:', err.message || err);
      }
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

      const phone                = uni.getStorageSync('phone')                || '';
      const doctorId             = uni.getStorageSync('currentDoctorId')      || '';
      const orderId              = uni.getStorageSync('currentOrderId')       || '';
      // 语言配置：可由设置页写入 storage，默认值遵循文档场景1（粤语医生 ↔ 普通话患者）
      const doctorSpeakLanguage  = uni.getStorageSync('doctorSpeakLanguage')  || 'yue-CN';
      const patientSpeakLanguage = uni.getStorageSync('patientSpeakLanguage') || 'zh-CN';
      const patientOutputFormat  = uni.getStorageSync('patientOutputFormat')  || 'simplified';
      const doctorOutputFormat   = uni.getStorageSync('doctorOutputFormat')   || 'traditional';

      console.log('[App] 通话开始 roomId:', this._roomId, 'phone:', phone, 'doctorId:', doctorId);

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
          doctorSpeakLanguage,
          patientSpeakLanguage,
          patientOutputFormat,
          doctorOutputFormat,
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
    // 使用 plus.net.WebSocket（APP-PLUS 原生 API），避免 uni.connectSocket
    // 在实机上不返回 SocketTask 的问题
    _connectSubtitleWs() {
      console.log('[App] 连接字幕 WS:', this._subtitleWsUrl);
      this._closeSubtitleWs();
      try {
        // plus.net.WebSocket 是 HTML5+ Runtime 提供的原生 WS，在 APP 上始终可用
        const ws = new plus.net.WebSocket(this._subtitleWsUrl);
        this._subtitleWs = ws;

        ws.onopen = () => {
          console.log('[App] 字幕 WS 已连接');
          this._reconnectCount = 0;
          if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
          }
        };

        ws.onmessage = (event) => {
          this._handleSubtitleMessage(event.data);
        };

        ws.onclose = (event) => {
          console.log('[App] 字幕 WS 断开 code:', event.code);
          this._subtitleWs = null;
          if (this._isInCall) this._scheduleReconnect();
        };

        ws.onerror = (err) => {
          console.log('[App] 字幕 WS 错误:', JSON.stringify(err));
        };

      } catch (err) {
        console.log('[App] 字幕 WS 连接异常:', err.message || err);
      }
    },

    // ── 字幕消息解析 ────────────────────────────────────────────────
    _handleSubtitleMessage(rawData) {
      try {
        const msg = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        if (!msg || msg.type !== 'text') return;

        const { speakerRole, convertedText, targetLanguage, isFinal } = msg;

        subtitleStore.currentText    = convertedText    || '';
        subtitleStore.speakerRole    = speakerRole      || '';
        subtitleStore.targetLanguage = targetLanguage   || '';
        subtitleStore.isFinal        = !!isFinal;

        if (isFinal && convertedText) {
          subtitleStore.history.push({
            speakerRole,
            text:           convertedText,
            targetLanguage: targetLanguage || '',
            timestamp:      msg.timestamp || Date.now(),
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
        try {
          // plus.net.WebSocket 用 close(code, reason) 关闭
          this._subtitleWs.close(1000, 'call ended');
        } catch (_) {}
        this._subtitleWs = null;
      }
      this._reconnectCount = 0;
    },

    // ── targetLanguage → 可读标签 ────────────────────────────────────
    _langLabel(targetLanguage) {
      const map = {
        'zh-CN': '简体',
        'zh-TW': '繁體',
        'en':    'EN',
      };
      return map[targetLanguage] || '';
    },

    // ── 同步 subtitleStore -> data()，驱动 template 渲染 ───────────
    _syncView() {
      this.subtitleVisible   = subtitleStore.active;
      this.subtitleText      = subtitleStore.currentText;
      this.subtitleRole      = subtitleStore.speakerRole;
      this.subtitleFinal     = subtitleStore.isFinal;
      this.subtitleLangLabel = this._langLabel(subtitleStore.targetLanguage);
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

.subtitle-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 6rpx;
  gap: 12rpx;
}

.subtitle-role {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.3;
}

.subtitle-lang {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.38);
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
