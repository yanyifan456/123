<template>
  <!-- #ifdef APP-PLUS -->
  <!-- 全局悬浮字幕层：仅在通话中显示 -->
  <view v-if="subtitleStore.active" class="subtitle-overlay" :style="subtitleStyle">
    <view class="subtitle-bar">
      <!-- 角色标签 -->
      <text class="subtitle-role">{{ subtitleStore.speakerRole === 'doctor' ? '医生' : '患者' }}</text>
      <!-- 字幕文本，未确认时有打字机动效标识 -->
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
      subtitleStore,       // 字幕全局状态（响应式，驱动模板渲染）
      subtitleStyle: {
        bottom: '180rpx',
      },
    };
  },
  // #endif

  onLaunch() {
    console.log('App Launch');
    // #ifdef APP-PLUS
    // 非响应式内部状态直接挂在实例上，避免被 Vue 代理
    this._isInCall              = false;
    this._roomId                = '';
    this._recordId              = null;
    this._audioWsUrl            = '';
    this._myTaskId              = '';
    this._audioWs               = null;
    this._subtitleWs            = null;
    this._subtitleWsUrl         = '';
    this._recorderManager       = null;
    this._subtitleReconnectTimer  = null;
    this._subtitleReconnectCount  = 0;

    this._initTUICallKit();
    // #endif
  },

  onShow() {
    console.log('App Show');
  },

  onHide() {
    console.log('App Hide');
  },

  // #ifdef APP-PLUS
  methods: {
    /**
     * 初始化 TUICallKit：登录 + 设置通话事件监听
     */
    _initTUICallKit() {
      try {
        const TUICallKit = uni.requireNativePlugin('TencentCloud-TUICallKit');
        if (!TUICallKit) throw new Error('插件未加载成功');

        const phone = uni.getStorageSync('phone');
        const validUserID = String(phone).replace(/[^a-zA-Z0-9_-]/g, '');
        const { userSig, sdkAppID } = genTestUserSig(validUserID);

        uni.$TUICallKit = TUICallKit;

        // 旧版原生插件 login：两个独立参数 (options, callback)
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
        console.error('🚨 TUICallKit 初始化失败:', err);
      }
    },

    /**
     * 设置通话事件监听器
     * onCallBegin → 启动录制 + 字幕
     * onCallEnd   → 停止录制 + 字幕
     */
    _setupCallListeners() {
      // 旧版 uni-app APP 原生插件通过 globalEvent 抛出事件
      // 参考：https://cloud.tencent.com/document/product/647/78764
      const globalEvent = uni.requireNativePlugin('globalEvent');
      if (!globalEvent) {
        console.log('[App] globalEvent 插件未加载，通话事件监听不可用');
        return;
      }

      // 来电通知：保存医生 callerId，供 startVideoRecord 使用
      globalEvent.addEventListener('onCallReceived', (res) => {
        console.log('[App] onCallReceived:', JSON.stringify(res));
        if (res && res.callerId) {
          uni.setStorageSync('currentDoctorId', res.callerId);
        }
      });

      // 通话接通：res.roomID（Number）是 TRTC 房间号
      globalEvent.addEventListener('onCallBegin', async (res) => {
        console.log('[App] onCallBegin:', JSON.stringify(res));
        const rid = res && (res.roomID || res.roomId || res.room_id);
        if (rid) this._roomId = String(rid);
        await this._onCallBegin();
      });

      // 通话挂断（任意一方）
      globalEvent.addEventListener('onCallEnd', async (res) => {
        console.log('[App] onCallEnd:', JSON.stringify(res));
        await this._onCallEnd();
      });

      // 以下事件均视为通话结束
      globalEvent.addEventListener('onCallCancelled', async () => {
        console.log('[App] onCallCancelled');
        await this._onCallEnd();
      });
      globalEvent.addEventListener('onUserReject', async () => {
        console.log('[App] onUserReject');
        await this._onCallEnd();
      });
      globalEvent.addEventListener('onUserNoResponse', async () => {
        console.log('[App] onUserNoResponse');
        await this._onCallEnd();
      });

      globalEvent.addEventListener('onError', (res) => {
        console.log('[App] TUICallKit onError:', JSON.stringify(res));
      });

      console.log('[App] globalEvent 监听器注册完成');
    },

    /**
     * 通话开始处理：
     * 1. 调用后端 /video/record/start 获取 taskId
     * 2. 连接音频 WebSocket 并开始录音
     * 3. 连接字幕 WebSocket
     */
    async _onCallBegin() {
      if (this._isInCall) return;
      this._isInCall = true;
      subtitleStore.active = true;
      subtitleStore.history = [];

      try {
        const phone    = uni.getStorageSync('phone')           || '';
        const doctorId = uni.getStorageSync('currentDoctorId') || '';
        const orderId  = uni.getStorageSync('currentOrderId')  || '';
        const roomId   = this._roomId;

        console.log('[App] 通话开始 roomId:', roomId, 'phone:', phone, 'doctorId:', doctorId);

        if (!roomId) {
          console.log('[App] roomId 为空，字幕无法启动');
          this._isInCall       = false;
          subtitleStore.active = false;
          return;
        }

        // 1. 启动后端录制 + ASR
        const res = await startVideoRecord({ roomId, userId: phone, doctorId, orderId });
        console.log('[App] startVideoRecord 响应:', JSON.stringify(res));

        const data       = res.data || {};
        const recordId   = data.recordId   || null;
        const userTaskId = data.userTaskId || '';
        const audioWsUrl = data.audioWsUrl || '';

        this._recordId   = recordId;
        this._myTaskId   = userTaskId;
        this._audioWsUrl = audioWsUrl;

        console.log('[App] recordId:', recordId, 'userTaskId:', userTaskId);

        // 2. 连接音频 WebSocket（文档：audioWsUrl + taskId）
        if (audioWsUrl && userTaskId) {
          this._connectAudioWs(audioWsUrl + userTaskId);
        } else {
          console.log('[App] audioWsUrl 或 userTaskId 为空，跳过音频 WS');
        }

        // 3. 连接字幕 WebSocket（文档：/ws/subtitle/{roomId}/{userId}）
        this._subtitleWsUrl = `${SUBTITLE_WS_HOST}/ws/subtitle/${roomId}/${phone}`;
        this._connectSubtitleWs(this._subtitleWsUrl);

      } catch (err) {
        console.log('[App] 通话开始处理失败:', err.message || err);
        this._isInCall       = false;
        subtitleStore.active = false;
      }
    },

    /**
     * 通话结束处理：
     * 1. 停止录音 + 关闭音频 WS（后端自动停止 ASR）
     * 2. 关闭字幕 WS
     * 3. 调用 /video/record/stop
     * 4. 清空全局字幕状态
     */
    async _onCallEnd() {
      if (!this._isInCall) return;
      this._isInCall = false;

      // 停止录音
      this._stopRecorder();

      // 关闭音频 WS（关闭后后端自动停止 ASR）
      if (this._audioWs) {
        try { this._audioWs.close(); } catch (_) {}
        this._audioWs = null;
      }

      // 关闭字幕 WS
      this._closeSubtitleWs();

      // 调用后端停止录制
      if (this._recordId) {
        try {
          await stopVideoRecord(this._recordId);
          console.log('[App] 录制已停止');
        } catch (err) {
          console.log('[App] 停止录制失败:', err.message || err);
        }
        this._recordId = null;
      }

      // 延迟 2s 后隐藏字幕，让最后一句话显示完
      setTimeout(() => {
        subtitleStore.active      = false;
        subtitleStore.currentText = '';
        subtitleStore.speakerRole = '';
      }, 2000);
    },

    // ─────────────────────────────────────────────
    // 音频采集 & 发送
    // ─────────────────────────────────────────────

    /**
     * 连接音频流 WebSocket
     * 连接成功后启动系统录音，将 PCM 数据通过 WS 发送
     * @param {String} wsUrl 完整的音频 WS 地址
     */
    _connectAudioWs(wsUrl) {
      console.log('🎤 连接音频 WS:', wsUrl);
      try {
        this._audioWs = uni.connectSocket({
          url: wsUrl,
          success: () => console.log('[AudioWS] 连接中...'),
          fail: (err) => console.error('[AudioWS] 连接失败:', err),
        });

        this._audioWs.onOpen(() => {
          console.log('✅ 音频 WS 已连接，开始录音');
          this._startRecorder();
        });

        this._audioWs.onClose(() => {
          console.log('[AudioWS] 连接已关闭');
          this._stopRecorder();
        });

        this._audioWs.onError((err) => {
          console.error('[AudioWS] 错误:', err);
          this._stopRecorder();
        });
      } catch (err) {
        console.error('❌ 音频 WS 连接异常:', err);
      }
    },

    /**
     * 启动录音管理器，采集 PCM 音频
     * 规格：16kHz, 16bit, 单声道，每 40ms 帧（640 字节）
     */
    _startRecorder() {
      try {
        this._recorderManager = uni.getRecorderManager();

        this._recorderManager.onFrameRecorded((res) => {
          // res.frameBuffer 是 ArrayBuffer，即 PCM 数据
          if (
            this._audioWs &&
            res.frameBuffer &&
            res.frameBuffer.byteLength > 0
          ) {
            try {
              this._audioWs.send({
                data: res.frameBuffer,
                success: () => {},
                fail: (err) => console.error('[AudioWS] 发送帧失败:', err),
              });
            } catch (e) {
              console.error('[AudioWS] send 异常:', e);
            }
          }
        });

        this._recorderManager.onStop(() => {
          console.log('[Recorder] 录音已停止');
        });

        this._recorderManager.onError((err) => {
          console.error('[Recorder] 错误:', err);
        });

        // 开始录音
        // frameSize: 每次回调的帧大小（KB），40ms@16kHz16bit单声道=640B≈0.625KB，取最小值1KB
        this._recorderManager.start({
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 256000,
          format: 'pcm',
          frameSize: 1, // 每帧约 1KB，接近 40ms
        });

        console.log('✅ 录音已启动 (PCM 16kHz 单声道)');
      } catch (err) {
        console.error('❌ 启动录音失败:', err);
      }
    },

    /**
     * 停止录音
     */
    _stopRecorder() {
      if (this._recorderManager) {
        try {
          this._recorderManager.stop();
        } catch (_) {}
        this._recorderManager = null;
      }
    },

    // ─────────────────────────────────────────────
    // 字幕 WebSocket
    // ─────────────────────────────────────────────

    /**
     * 连接字幕 WebSocket，接收实时字幕 JSON
     * @param {String} wsUrl
     */
    _connectSubtitleWs(wsUrl) {
      console.log('📝 连接字幕 WS:', wsUrl);
      this._subtitleReconnectCount = 0;

      try {
        this._subtitleWs = uni.connectSocket({
          url: wsUrl,
          success: () => console.log('[SubtitleWS] 连接中...'),
          fail: (err) => console.error('[SubtitleWS] 连接失败:', err),
        });

        this._subtitleWs.onOpen(() => {
          console.log('✅ 字幕 WS 已连接');
          this._subtitleReconnectCount = 0;
          if (this._subtitleReconnectTimer) {
            clearTimeout(this._subtitleReconnectTimer);
            this._subtitleReconnectTimer = null;
          }
        });

        this._subtitleWs.onMessage((event) => {
          this._handleSubtitleMessage(event.data);
        });

        this._subtitleWs.onClose(() => {
          console.log('[SubtitleWS] 连接已断开');
          if (this._isInCall) {
            this._scheduleSubtitleReconnect(wsUrl);
          }
        });

        this._subtitleWs.onError((err) => {
          console.error('[SubtitleWS] 错误:', err);
        });
      } catch (err) {
        console.error('❌ 字幕 WS 连接异常:', err);
      }
    },

    /**
     * 处理服务端推送的字幕 JSON
     * {type, speakerId, speakerRole, originalText, convertedText,
     *  language, targetLanguage, roomId, isFinal, timestamp}
     */
    _handleSubtitleMessage(rawData) {
      try {
        const msg = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        if (msg.type !== 'text') return;

        const { speakerRole, convertedText, isFinal } = msg;

        // 更新全局字幕状态（响应式，页面自动刷新）
        subtitleStore.currentText = convertedText || '';
        subtitleStore.speakerRole = speakerRole || '';
        subtitleStore.isFinal = !!isFinal;

        if (isFinal) {
          // 最终结果：加入历史记录
          subtitleStore.history.push({
            speakerRole,
            text: convertedText,
            timestamp: msg.timestamp || Date.now(),
          });

          // 历史记录最多保留 30 条
          if (subtitleStore.history.length > 30) {
            subtitleStore.history.shift();
          }
        }
      } catch (err) {
        console.error('[SubtitleWS] 解析字幕消息失败:', err, rawData);
      }
    },

    /**
     * 字幕 WS 断线重连（指数退避，最多 5 次）
     */
    _scheduleSubtitleReconnect(wsUrl) {
      if (this._subtitleReconnectCount >= 5) {
        console.warn('[SubtitleWS] 已达最大重连次数，放弃重连');
        return;
      }
      const delay = Math.min(1000 * Math.pow(2, this._subtitleReconnectCount), 30000);
      this._subtitleReconnectCount++;
      console.log(`[SubtitleWS] ${delay}ms 后重连 (第${this._subtitleReconnectCount}次)`);

      this._subtitleReconnectTimer = setTimeout(() => {
        if (this._isInCall) {
          this._connectSubtitleWs(wsUrl);
        }
      }, delay);
    },

    /**
     * 关闭字幕 WS
     */
    _closeSubtitleWs() {
      if (this._subtitleReconnectTimer) {
        clearTimeout(this._subtitleReconnectTimer);
        this._subtitleReconnectTimer = null;
      }
      if (this._subtitleWs) {
        try { this._subtitleWs.close(); } catch (_) {}
        this._subtitleWs = null;
      }
    },
  },
  // #endif
};
</script>

<style lang="scss">
/* 每个页面公共 CSS */
@import "@/styles/index.scss";

/* ─── 全局悬浮字幕 ─── */
/* #ifdef APP-PLUS */
.subtitle-overlay {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none; /* 不遮挡通话操作按钮 */
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

/* 中间结果：添加底部下划线表示"正在说" */
.subtitle-interim {
  text-decoration: underline;
  text-decoration-color: rgba(255, 255, 255, 0.5);
  text-underline-offset: 4rpx;
}
/* #endif */
</style>
