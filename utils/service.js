/**
 * axios 封装
 */
import axios from "axios";
import { showToast } from "./feedback.js";
import config from "@/config/base.js";

/**
 * 创建 Axios 实例
 */
const baseURL = "http://192.168.100.19:18085"; // ⚠️ 建议替换为你配置在小程序后台的 https 域名
const request = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config) => {
    const token = uni.getStorageSync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response) => {
    if (response.data?.code !== 200) {
      const errMsg = response.data?.message || "Business Error";
      showToast(errMsg);
      return Promise.reject(new Error(errMsg));
    }
    return response.data.data; // 直接返回业务数据
  },
  (error) => {
    let errMessage = "Network Error";

    if (error.response) {
      switch (error.response.status) {
        case 401:
          errMessage = "权限错误";
          uni.navigateTo({ url: "/pages/login/login" });
          break;
        case 404:
          errMessage = "找不到当前接口";
          break;
        case 500:
          errMessage = "服务器错误";
          break;
        default:
          errMessage =
            error.response.data?.message || `Error ${error.response.status}`;
      }
    } else if (error.request) {
      errMessage = "请求无响应";
    }

    showToast(errMessage);
    return Promise.reject(error);
  }
);

export default request;
