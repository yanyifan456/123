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
      subtitleStore,       // 字幕全局状态（响应式）
      subtitleStyle: {     // 悬浮字幕位置（可根据通话界面调整）
        bottom: '180rpx',
      },

      // ---------- 内部状态（不需要响应式）----------
      _callState: {
        isInCall: false,
        roomId: '',
        userId: '',        // 当前登录手机号
        doctorId: '',
        orderId: '',
        recordId: null,
        isDoctor: false,   // 当前用户角色
        audioWsUrl: '',    // 来自后端的音频 WS 地址前缀
        myTaskId: '',      // 当前用户对应的 taskId
      },

      _audioWs: null,      // 音频流 WebSocket
      _subtitleWs: null,   // 字幕 WebSocket
      _recorderManager: null, // 录音管理器
      _subtitleReconnectTimer: null, // 字幕重连定时器
      _subtitleReconnectCount: 0,
    };
  },
  // #endif

  onLaunch() {
    console.log('App Launch');
    // #ifdef APP-PLUS
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

        // 保存当前用户手机号到通话状态
        this._callState.userId = phone;

        TUICallKit.login({
          SDKAppID: sdkAppID,
          userID: validUserID,
          userSig,
          success: (res) => {
            console.log('✅ TUICallKit 登录成功:', res);
            this._setupCallListeners();
          },
          fail: (err) => {
            console.error('❌ TUICallKit 登录失败:', err);
            uni.showToast({ title: '通话服务登录失败', icon: 'none' });
          },
        });

        TUICallKit.setSelfInfo({
          nickName: uni.getStorageSync('userName') || '患者',
          avatar: '',
          success: () => {},
          fail: (err) => console.error('❌ setSelfInfo 失败:', err),
        });
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
      const kit = uni.$TUICallKit;

      // 收到来电邀请（提前保存通话元数据）
      kit.on('onInvited', (data) => {
        console.log('📞 收到来电邀请:', data);
        // data.roomId 由 TRTC 分配，此时保存
        if (data && data.roomId) {
          this._callState.roomId = String(data.roomId);
        }
      });

      // 通话开始
      kit.on('onCallBegin', async (data) => {
        console.log('📹 通话开始:', data);
        if (data && data.roomId) {
          this._callState.roomId = String(data.roomId);
        }
        await this._onCallBegin();
      });

      // 通话结束
      kit.on('onCallEnd', async (data) => {
        console.log('📹 通话结束:', data);
        await this._onCallEnd();
      });

      kit.on('onError', (err) => {
        console.error('❌ TUICallKit 错误:', err);
      });

      console.log('✅ TUICallKit 监听器设置完成');
    },

    /**
     * 通话开始处理：
     * 1. 调用后端 /video/record/start 获取 taskId
     * 2. 连接音频 WebSocket 并开始录音
     * 3. 连接字幕 WebSocket
     */
    async _onCallBegin() {
      if (this._callState.isInCall) return;
      this._callState.isInCall = true;
      subtitleStore.active = true;
      subtitleStore.history = [];

      try {
        const phone = uni.getStorageSync('phone') || this._callState.userId;
        const doctorId = uni.getStorageSync('currentDoctorId') || '';
        const orderId = uni.getStorageSync('currentOrderId') || '';
        const roomId = this._callState.roomId;

        if (!roomId) {
          console.error('❌ 通话开始时 roomId 为空');
          return;
        }

        // 1. 启动后端录制 + ASR
        const res = await startVideoRecord({
          roomId,
          userId: phone,
          doctorId,
          orderId,
        });

        const { recordId, doctorTaskId, userTaskId, audioWsUrl } = res.data;
        this._callState.recordId = recordId;
        this._callState.audioWsUrl = audioWsUrl;

        // 当前用户是患者侧（APP 端均为患者）
        this._callState.isDoctor = false;
        this._callState.myTaskId = userTaskId;

        console.log('✅ 录制启动成功, recordId:', recordId, 'taskId:', userTaskId);

        // 2. 连接音频 WebSocket
        this._connectAudioWs(audioWsUrl + userTaskId);

        // 3. 连接字幕 WebSocket（用患者 userId 即手机号）
        const subtitleWsUrl = `${SUBTITLE_WS_HOST}/ws/subtitle/${roomId}/${phone}`;
        this._connectSubtitleWs(subtitleWsUrl);
      } catch (err) {
        console.error('❌ 通话开始处理失败:', err);
        this._callState.isInCall = false;
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
      if (!this._callState.isInCall) return;
      this._callState.isInCall = false;

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
      if (this._callState.recordId) {
        try {
          await stopVideoRecord(this._callState.recordId);
          console.log('✅ 录制已停止');
        } catch (err) {
          console.error('❌ 停止录制失败:', err);
        }
        this._callState.recordId = null;
      }

      // 延迟 2s 后隐藏字幕（让最后一条字幕显示完）
      setTimeout(() => {
        subtitleStore.active = false;
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
          // 通话中自动重连（最多 5 次）
          if (this._callState.isInCall) {
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
        if (this._callState.isInCall) {
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
