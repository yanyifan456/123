/**
 * 全局字幕状态管理
 * 使用 uni.$subtitle 作为响应式全局对象，支持跨页面访问
 *
 * 字段说明：
 *   active          Boolean   是否正在通话（字幕显示中）
 *   currentText     String    当前显示的字幕文本（convertedText）
 *   speakerRole     String    说话人角色 'doctor' | 'user'
 *   isFinal         Boolean   是否是最终结果
 *   history         Array     已固定的字幕历史（isFinal=true 的条目）
 */

import { reactive } from 'vue';

const subtitleStore = reactive({
  active:         false,
  currentText:    '',
  speakerRole:    '',
  targetLanguage: '',   // 'zh-CN' | 'zh-TW' | 'en' — 当前字幕目标语言
  isFinal:        false,
  history:        [],   // [{ speakerRole, text, targetLanguage, timestamp }]
});

export default subtitleStore;
