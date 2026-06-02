/**
 * 实时字幕 / 视频录制 接口
 * 文档：前端对接文档-实时字幕与语音识别
 */

import request from '@/utils/request.js';

// infusionalarm WebSocket 服务地址（音频 + 字幕）
export const SUBTITLE_WS_HOST = 'ws://192.168.100.14:8089';

/**
 * 开始视频录制 + 启动语音识别
 * @param {Object} params
 * @param {String} params.roomId            TRTC 房间号
 * @param {String} params.userId            用户手机号
 * @param {String} params.doctorId          医生 ID
 * @param {String} [params.orderId]         订单 ID
 * @param {String} [params.doctorSpeakLanguage]   医生说话语言，默认 yue-CN
 * @param {String} [params.patientSpeakLanguage]  患者说话语言，默认 zh-CN
 * @param {String} [params.patientOutputFormat]   患者看到字幕格式，默认 simplified
 * @param {String} [params.doctorOutputFormat]    医生看到字幕格式，默认 traditional
 * @returns {Promise<{recordId, doctorTaskId, userTaskId, audioWsUrl}>}
 */
export const startVideoRecord = (params) => {
  return request({
    url: '/video/record/start',
    method: 'POST',
    data: {
      doctorSpeakLanguage: 'yue-CN',
      patientSpeakLanguage: 'zh-CN',
      patientOutputFormat: 'simplified',
      doctorOutputFormat: 'traditional',
      ...params,
    },
  });
};

/**
 * 停止视频录制
 * @param {Number|String} recordId  录制记录ID
 */
export const stopVideoRecord = (recordId) => {
  return request({
    url: `/video/record/stop/${recordId}`,
    method: 'POST',
    data: {},
  });
};
