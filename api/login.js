import request from "@/utils/request.js";

/**
 * 微信手机号登录
 * @param {string} code - 微信返回的授权 code
 * @param {string} state - 可选参数
 */
export const wechatPhoneLogin = (code, state) => {
  return request({
    url: "/medicine/wechat/callback",
    method: "GET",
    data: { code, state }, // uni.request GET 时 data 会自动拼接 query 参数
  });
};

/**
 * 解绑设备
 * @param {string} userId - 用户id
 * @param {string} deviceId - 设备id
 */
export const unBindDevicce = (userId, deviceId) => {
  return request({
    url: "/app/userDevice/unbinduserdevice",
    method: "POST",
    data: { userId, deviceId },
  });
};

/**
 * 绑定设备
 * @param {string} userId - 用户id
 * @param {string} deviceId - 设备id
 */
export const bindDevice = (userId, deviceId) => {
  return request({
    url: "/app/userDevice/bindDevice",
    method: "POST",
    data: { userId, deviceId },
  });
};

/**
 * 获取设备列表
 * @param {string} userId - 用户id
 */
export const getDeviceList = (userId) => {
  return request({
    url: "/app/userDevice/getDeviceList",
    method: "POST",
    data: { userId },
  });
};
//身份校验
export const getsfjy = (data) => {
  return request({
    url: "/mini/user/auth/id2Verify",
    method: "POST",
    data,
  });
};
//编辑信息
export const getuserxiugai = (data) => {
  return request({
    url: "/miduser/updateUserInfo",
    method: "POST",
    data,
  });
};
//获取信息
export const getuser = (data) => {
  return request({
    url: "/mini/user/selectUserDetail",
    method: "POST",
    data,
  });
};
//预约费用查询
export const selectuserorderlist = (data) => {
  return request({
    url: "/mini/acceptuserorder/selectuserorderlist",
    method: "POST",
    data,
  });
};
//会诊记录列表
export const selectconsultationlist = (data) => {
  return request({
    url: "/mini/acceptuserorder/selectconsultationlist",
    method: "POST",
    data,
  });
};
