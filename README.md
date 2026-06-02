## hkmedicineapp

环球港医网app应用

# 环球港医App技术文档

## 项目概述

**项目名称**: 环球港医 (Global Harbor Medical)
**应用类型**: 医疗健康类移动应用
**开发框架**: uni-app + Vue 3
**支持平台**: Android
**当前版本**: v1.0.2

### 项目简介

环球港医是一款综合性的医疗健康服务平台，提供在线问诊、药品购买、健康监测、医疗咨询等服务。用户可以通过该应用进行医生预约、药品商城购物、健康数据监测（配合智能手表）、AI医疗咨询等功能。

## 技术栈

### 前端框架
- **核心框架**: Vue 3 (Composition API)
- **跨平台框架**: uni-app
- **状态管理**: Pinia ^3.0.4
- **UI组件库**: uview-ui ^2.0.38, uni-ui系列组件
- **图表库**: ECharts ^6.0.0
- **HTTP客户端**: Axios ^1.13.5
- **国际化**: vue-i18n (支持简体中文、繁体中文、英文)

### 工具库
- **日期处理**: dayjs ^1.11.19
- **Markdown解析**: marked ^4.3.0
- **PDF处理**: pdf-lib ^1.17.1
- **CSS预处理器**: SCSS/Sass ^1.97.3

### 原生插件
- **人脸识别**: AP-FaceDetectModule (阿里云金融级实人认证SDK)
- **音视频通话**: TencentCloud-TUICallKit (腾讯云音视频插件)
- **即时通讯**: tim-js-sdk ^2.27.6

### 构建工具
- **包管理器**: npm
- **编译工具**: HBuilderX / uni-app CLI

## 项目架构

### 目录结构

```
hkmedicineapp/
├── api/                    # API接口层
│   ├── base.js            # 基础业务API（消息、医生、药品、购物车等）
│   ├── login.js           # 登录相关API
│   └── yyf.js             # 其他业务API（包含签章、实名认证等）
├── pages/                  # 页面文件
│   ├── home/              # 首页模块
│   │   ├── home.vue       # 主页
│   │   ├── list/          # 列表详情页（医生、药品、预约等）
│   │   ├── watch/         # 健康监测页（心率、血压、睡眠等）
│   │   └── infomation/    # 资讯详情页
│   ├── login/             # 登录认证模块
│   ├── message/           # 消息模块
│   ├── cart/              # 购物车模块
│   ├── mine/              # 个人中心模块
│   │   ├── Record/        # 买药记录
│   │   ├── minelist/      # 个人设置列表
│   │   └── refund/        # 退款管理
│   ├── loading/           # 启动页
│   ├── webview/           # WebView容器
│   └── protocol/          # 协议详情
├── components/             # 公共组件（如有）
├── utils/                  # 工具函数
│   ├── request.js         # HTTP请求封装
│   ├── setting.js         # 环境配置
│   ├── tabBarBadge.js     # TabBar角标管理
│   ├── jumpTo.js          # 页面跳转工具
│   ├── navigation.js      # 导航工具
│   ├── global.js          # 全局工具函数
│   ├── i18n.js            # 国际化工具
│   ├── feedback.js        # 反馈工具
│   ├── permission.js      # 权限管理
│   ├── service.js         # 服务工具
│   ├── statusBar.js       # 状态栏工具
│   ├── tabbar.js          # TabBar工具
│   └── china_area.js      # 中国地区数据
├── locale/                 # 国际化语言包
│   ├── index.js           # i18n配置
│   ├── zh-Hans.json       # 简体中文
│   ├── zh-Hant.json       # 繁体中文
│   └── en.json            # 英文
├── styles/                 # 样式文件
│   ├── index.scss         # 主样式入口
│   ├── base.scss          # 基础样式
│   ├── tokens/            # 设计令牌
│   ├── semantic/          # 语义化样式
│   └── mixins/            # SCSS混入
├── static/                 # 静态资源
│   ├── images/            # 图片资源
│   ├── img/               # 其他图片
│   ├── tabbar/            # TabBar图标
│   ├── iconfont/          # 图标字体
│   └── watch/             # 手表相关图片
├── uni_modules/            # uni-app插件市场组件
│   ├── uview-plus/        # uView Plus组件库
│   ├── uni-*/             # uni-ui系列组件
│   └── lime-echart/       # ECharts组件
├── nativePlugins/          # 原生插件
│   ├── AP-FaceDetectModule/    # 人脸识别插件
│   └── TencentCloud-TUICallKit/ # 腾讯云通话插件
├── debug/                  # 调试工具
├── unpackage/              # 打包输出目录
├── App.vue                 # 应用根组件
├── main.js                 # 应用入口
├── pages.json              # 页面配置
├── manifest.json           # 应用配置
├── package.json            # 依赖配置
├── uni.scss                # 全局SCSS变量
└── .env                    # 环境变量
```

### 架构分层

1. **表现层 (Pages/Components)**: Vue页面和组件，负责UI渲染和用户交互
2. **业务逻辑层 (Utils/API)**: 业务逻辑处理、API调用封装
3. **数据层 (Pinia/Storage)**: 状态管理和本地存储
4. **基础设施层 (Plugins/Native)**: 原生插件和第三方服务集成

## 核心功能模块

### 1. 用户认证模块

**功能特性**:
- 手机号登录/注册
- 实名认证（集成阿里云人脸识别）
- 用户协议和隐私政策签署 ⚠️ **调用第三方签章接口**
- Token自动管理和过期处理

**关键文件**:
- `pages/login/login.vue` - 登录页面
- `pages/login/renzhen.vue` - 实名认证
- `pages/mine/qs.vue` - 数据使用协议签署 ⚠️ **第三方签章**
- `api/login.js` - 登录API
- `api/yyf.js` - 签章相关API ⚠️ **第三方接口**
- `utils/request.js` - Token管理

**认证流程**:
```javascript
// Token管理机制
- 登录成功后保存token到localStorage
- 每次请求自动携带Authorization header
- 401错误自动跳转登录页
- Token过期提示重新登录
```

### 2. 医疗服务模块

**功能特性**:
- 医生列表浏览和搜索
- 科室分类查看
- 医生详情展示
- 在线预约挂号
- 预约记录管理
- 会诊记录查询

**关键API**:
```javascript
getDoctorList()        // 获取医生列表
getDepart()            // 获取科室列表
getDoctorByDepart()    // 按科室查询医生
getDoctorDetail()      // 查询医生详情
createPayOrder()       // 创建预约订单
selectUserOrderList()  // 查询预约费用
checkDoctorSchedule()  // 查询医生排班
```

**业务流程**:
1. 用户选择科室或搜索医生
2. 查看医生详情和排班时间
3. 选择时间段创建预约订单
4. 完成支付（微信/支付宝）
5. 查看预约记录和状态

### 3. 药品商城模块

**功能特性**:
- 药品分类浏览
- 药品搜索和筛选
- 药品详情展示
- 购物车管理
- 物流跟踪
- 买药记录查询

**关键API**:
```javascript
getMedicalList()       // 查询药品列表
getMedicalType()       // 查询药品分类
getMedicalDetail()     // 查询药品详情
addToCart()            // 添加购物车
getCartList()          // 购物车列表
updataCartNum()        // 修改购物车数量
deleteCart()           // 删除购物车商品
getAddressList()       // 收货地址列表
createTradeInfo()      // 创建交易记录
```

**购物车流程**:
```javascript
添加商品 → 购物车列表 → 选择商品
```

### 4. 健康监测模块

**功能特性**:
- 8项健康数据采集（心率、血压、血氧、睡眠、步数、热量、呼吸、压力）
- 健康数据可视化图表
- 历史数据查询
- AI健康解读
- 异常指标预警
- 人体画像分析

**关键API**:
```javascript
getWatchList()              // 获取手表列表
getWatchDataApi()           // 获取手表8项数据
getWatchDataByType()        // 按类型获取具体数据
getEchartsDataNew()         // 获取图表数据
getPersonal()               // 获取人体画像数据
getInterpretation()         // AI立即解读（通义千问大模型）
getInterpretationTime()     // 获取历史解读时间
getInterpretationList()     // 获取历史解读列表
getInterpretationDetail()   // 获取解读详情
getHistoryIll()             // 获取既往病史
```

**监测页面**:
- `pages/home/watch/watchHr.vue` - 心率监测
- `pages/home/watch/watchBp.vue` - 血压监测
- `pages/home/watch/watchBoxy.vue` - 血氧监测
- `pages/home/watch/watchSleep.vue` - 睡眠监测
- `pages/home/watch/watchStep.vue` - 步数统计
- `pages/home/watch/watchCalorie.vue` - 热量消耗
- `pages/home/watch/breath.vue` - 呼吸监测
- `pages/home/watch/watchHrv.vue` - 压力监测
- `pages/home/watch/watchTmpr.vue` - 温度监测

**数据流程**:
```
智能手表 → 蓝牙同步 → 云端存储 → APP拉取 → 图表展示 → AI解读
```

### 5. AI医疗咨询模块

**功能特性**:
- AI助手对话
- 智能问诊建议
- 处方单生成
- 建议单详情查看

**技术实现**:
- 集成通义千问大模型 (`/apphealth/qianwen/bigmodelstream`)
- 流式响应处理
- 超时控制（125秒）

### 6. 消息通知模块

**功能特性**:
- 消息列表展示
- 未读消息角标
- 消息详情查看
- 已读状态更新
- TabBar消息提醒

**关键API**:
```javascript
getMsgList()     // 获取消息列表
getMsgCount()    // 获取消息总数（未读数）
getMsgDetail()   // 获取消息详情并标记已读
```

### 7. 音视频通话模块

**功能特性**:
- 一对一视频通话
- 语音通话
- 来电监听
- 通话记录

**技术实现**:
- 腾讯云TUICallKit原生插件
- UserSig签名验证
- 事件监听器（onInvited, onCallBegin, onCallEnd）

**初始化代码**:
```javascript
// TUICallKit登录
uni.$TUICallKit.login({ 
  SDKAppID: sdkAppID,
  userID: validUserID,
  userSig,
  success: (res) => {
    console.log("✅ TUICallKit 登录成功");
    setupTUICallKitListeners();
  }
});

// 设置事件监听
uni.$TUICallKit.on('onInvited', (data) => {
  console.log("📞 收到来电邀请:", data);
});
```

### 8. 病历管理模块

**功能特性**:
- 病历上传
- 病历详情查看

**关键API**:
```javascript
createCase()            // 新增病历
getPrescriptionDetai()  // 查看处方详情
```

### 9. 个人中心模块

**功能特性**:
- 个人资料编辑
- 收货地址管理
- 意见反馈
- 联系客服
- 关于我们
- 隐私协议查看
- 数据使用协议签署 ⚠️ **调用第三方签章接口**

## API接口规范

### 基础配置

**生产环境**: `https://hqgy.gzxinxingyiyuan.com/api/`
**测试环境**: `https://www.ruoguzhichuang.com/api`

### 请求封装

```javascript
// utils/request.js
async function request(options = {}, baseUrl) {
  // 1. 网络检测
  await checkNetwork();
  
  // 2. 自动携带Token
  header: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }
  
  // 3. 统一错误处理
  - 401: Token过期，跳转登录
  - 非200: 显示错误提示
  - code !== 200: 业务错误提示
  
  // 4. 超时设置: 默认60秒
}
```

### 通用响应格式

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

### 主要接口分类

#### 用户相关
- `/mini/user/getreciveaddress` - 收货地址
- `/health/getuserMedicalInfo` - 用户医疗信息

#### 医生相关
- `/mini/doctor/selectDoctorListByDoctorName` - 医生列表
- `/mini/depart/selectDepartList` - 科室列表
- `/mini/doctor/selectDoctorDetail` - 医生详情

#### 预约相关
- `/mini/acceptuserorder/adduserorder` - 创建预约
- `/mini/acceptuserorder/selectuserorderlist` - 预约列表
- `/mini/acceptuserorder/updateuserorder` - 取消预约（未支付）
- `/mini/acceptuserorder/updateuserorderrefund` - 取消预约（已支付退款）

#### 药品相关
- `/app/midmedicine/selectMedicineList` - 药品列表
- `/midmedicine/selectMedicineDetail` - 药品详情
- `/shopping/addShopCart` - 添加购物车
- `/shopping/getshopcart` - 购物车列表

#### 健康数据
- `/app/userDevice/getDeviceList` - 设备列表
- `/app/health/getHealthData` - 健康数据
- `/apphealth/qianwen/bigmodelstream` - AI解读

#### 消息相关
- `/msg/list` - 消息列表
- `/msg/count` - 消息计数
- `/msg/msgDetailAndUpdate` - 消息详情

#### 支付相关
- `/third/hqmedicine/wpay` - 微信支付
- `/third/zhifubao/wpay` - 支付宝支付
- `/mini/acceptuserorder/insertpay` - 支付订单

#### ⚠️ 电子签章相关（第三方接口）
- `/third/person/signature` - 个人签名生成 ⚠️ **第三方接口**
- `/third/signature/contract` - 合同签署 ⚠️ **第三方接口**
- `/third/signature/templete` - 合同模板获取 ⚠️ **第三方接口**

#### 实名认证相关
- `/verify/init` - 实名认证初始化（阿里云）
- `/verify/result` - 实名认证结果查询（阿里云）
- `/appmedicine/auth/appId2Verify` - 身份证信息提交

#### 物流追踪
- `/third/jdorderquerytrace` - 京东物流订单追踪

#### 客服聊天系统
- `/chat/history` - 聊天历史记录
- `/chat/send` - 发送聊天消息
- `/chat/customer/service/online` - 客服在线状态
- `wss://hqgy.gzxinxingyiyuan.com/ws/chat` - WebSocket实时聊天

## 第三方签章服务说明 ⚠️

### 服务概述

本项目中的**用户协议签署**、**数据使用协议签署**等功能调用了第三方电子签章服务接口。

### 接口位置

所有签章相关接口定义在 `api/yyf.js` 文件中：

```javascript
// api/yyf.js

// 1. 个人签名生成
export const signature = (data) => {
  return request({
    url: "/third/person/signature",  // ⚠️ 第三方接口
    method: "POST",
    data,
  });
};

// 2. 合同签署
export const contract = (data) => {
  return request({
    url: "/third/signature/contract",  // ⚠️ 第三方接口
    method: "POST",
    data,
  });
};

// 3. 获取合同模板
export const templete = (data) => {
  return request({
    url: "/third/signature/templete",  // ⚠️ 第三方接口
    method: "POST",
    data,
  });
};
```

### 使用场景

#### 场景1: 数据使用协议签署 (`pages/mine/qs.vue`)

```javascript
import { contract, templete } from '@/api/yyf.js'

// 1. 获取合同模板
const templateRes = await templete({
  // 模板参数
})

// 2. 用户阅读并签署
const params = {
  userId: uni.getStorageSync('userId'),
  contract: fileData,  // 签署后的文件数据
  // ...其他参数
}

const res = await contract(params)

if (res.code === '200') {
  uni.showToast({ title: '签署成功' })
} else {
  uni.showToast({ title: res.msg || '签署失败', icon: 'none' })
}
```

#### 场景2: 访问权限校验 (`pages/home/home.vue`, `pages/mine/mine.vue`)

在进行某些操作前，需要校验用户是否已完成协议签署：

```javascript
import { jiaoyan } from '@/api/yyf.js'

// 校验用户是否完成实名认证和协议签署
const res = await jiaoyan({ userId })

if (res.code === '200') {
  // signTag: '0' 表示未签署合同
  if (res.data.signTag === '0') {
    uni.showToast({
      title: '未签署合同!',
      icon: 'none',
      duration: 1500
    });
    
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/mine/mine'
      });
    }, 1500);
    
    return;
  }
  
  // 已签署，继续正常流程
}
```

### 签章流程

```
1. 获取合同模板 (templete)
   ↓
2. 展示合同内容给用户
   ↓
3. 用户阅读并同意
   ↓
4. 生成个人签名 (signature)
   ↓
5. 提交合同签署 (contract)
   ↓
6. 第三方返回签署结果
   ↓
7. 更新用户签署状态
   ↓
8. 后续通过 jiaoyan 接口校验签署状态
```

### 注意事项

⚠️ **重要提醒**:

1. **网络依赖**: 签章功能完全依赖第三方服务，需确保网络连接正常
2. **超时处理**: 第三方接口可能响应较慢，建议设置合理的超时时间
3. **错误处理**: 需要处理第三方服务不可用的情况，提供友好的错误提示
4. **数据安全**: 签署数据涉及用户隐私，全程使用HTTPS加密传输
5. **签署记录**: 建议在本地保存签署时间和状态，避免重复签署
6. **降级方案**: 当第三方服务不可用时，应有相应的降级处理策略

### 相关文件

- **API定义**: `api/yyf.js` (第45-65行)
- **协议签署页面**: `pages/mine/qs.vue`
- **权限校验**: `pages/home/home.vue` (第322-381行)
- **个人中心校验**: `pages/mine/mine.vue` (第256行、第442行)


## 样式系统

### SCSS变量体系

**设计令牌 (styles/tokens/)**:
- 颜色变量
- 间距变量
- 圆角变量
- 字体大小变量
- 阴影变量

**语义化样式 (styles/semantic/)**:
- 按钮样式
- 卡片样式
- 表单样式
- 布局样式

**Mixins (styles/mixins/)**:
```scss
@include flex-center          // Flex居中
@include flex-between         // Flex两端对齐
@include flex-col-center      // Flex垂直居中
@include grid-col-2           // 2列网格
@include grid-col-4           // 4列网格
```

### 主题色
- **主色**: `#459767` (绿色系)
- **危险色**: 红色系
- **文字色**: 多级灰度
- **背景色**: `#f8f8f8`

## 路由配置

### TabBar页面
- `/pages/home/home` - 首页
- `/pages/message/message` - 消息
- `/pages/cart/cart` - 购物车
- `/pages/mine/mine` - 我的

### 主要路由分组

**首页模块**:
- 搜索页面
- 医生列表/详情
- 药品商城/详情
- AI咨询
- 健康指标
- 报告解读
- 手表监测（9个子页面）

**预约模块**:
- 预约看诊
- 科室选择
- 医生详情
- 预约详情
- 支付成功
- 预约记录
- 会诊记录

**个人中心**:
- 买药记录/详情/物流
- 地址管理
- 意见反馈
- 病历管理
- 退款管理
- 资料编辑
- 实名认证
- 协议签署 ⚠️ **第三方签章**

## 状态管理

### Pinia Store（如使用）

项目中集成了Pinia作为状态管理方案，用于：
- 用户信息管理
- 购物车状态
- 健康数据缓存
- 全局配置

### 本地存储

```javascript
// 常用Storage Key
uni.getStorageSync('token')      // 用户Token
uni.getStorageSync('userId')     // 用户ID
uni.getStorageSync('phone')      // 手机号
uni.getStorageSync('userName')   // 用户名
uni.getStorageSync('userLocale') // 语言设置
uni.getStorageSync('privacy_status') // 隐私协议状态
uni.getStorageSync('signTag')    // 合同签署状态 ⚠️
```

## 原生能力集成

### 1. 蓝牙通信
- 模块: `Bluetooth`
- 用途: 智能手表数据同步

### 2. 扫码功能
- 模块: `Barcode`
- 用途: 二维码扫描

### 3. 相机相册
- 模块: `Camera`
- 用途: 病历拍照上传、头像设置

### 4. 支付功能
- 支付宝支付: Android平台
- 模块: `Payment`

### 5. 地图定位
- 用途: 地址选择、位置服务

### 6. 推送通知

### 7. 人脸识别
- 插件: AP-FaceDetectModule
- 服务商: 阿里云金融级实人认证
- 用途: 实名认证

### 8. 音视频通话
- 插件: TencentCloud-TUICallKit
- 服务商: 腾讯云
- 功能: 医患视频问诊

## 性能优化

### 1. 图片优化
- 使用CDN加速
- 适当的图片压缩
- 懒加载策略

### 2. 请求优化
- 统一的请求拦截器
- 错误重试机制
- 超时控制
- 防抖节流处理

### 3. 页面优化
- 下拉刷新控制
- 分页加载
- 虚拟列表（大数据场景）

### 4. 包体积优化
- 按需引入组件
- Tree Shaking
- 资源压缩

## 安全策略

### 1. 数据安全
- HTTPS传输
- Token认证
- 敏感信息加密存储

### 2. 权限控制
- 登录态校验
- 实名认证检查
- 协议签署验证 ⚠️ **第三方签章状态校验**

### 3. 隐私保护
- 隐私政策弹窗
- 数据使用协议
- 最小权限原则

## 部署与发布

### 开发环境
```bash
# 安装依赖
npm install

# 运行Android App
npm run dev:app-plus
```

### 生产打包

**Android APK打包流程**:
1. HBuilderX → 发行 → 原生App-云打包
2. 选择Android平台
3. 填写证书信息（或使用公共测试证书）
4. 配置权限和模块
5. 生成APK文件
6. 签名验证
7. 发布到应用市场或直接分发

**Android权限配置**:
```json
{
  "permissions": [
    "CHANGE_NETWORK_STATE",
    "MOUNT_UNMOUNT_FILESYSTEMS",
    "VIBRATE",
    "READ_LOGS",
    "ACCESS_WIFI_STATE",
    "ACCESS_NETWORK_STATE",
    "CAMERA",
    "GET_ACCOUNTS",
    "READ_PHONE_STATE",
    "CHANGE_WIFI_STATE",
    "WAKE_LOCK",
    "FLASHLIGHT",
    "WRITE_SETTINGS",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE",
    "MANAGE_EXTERNAL_STORAGE"
  ]
}
```

**支付配置**:
- **支付宝支付**: Android平台

### 版本管理
- 当前版本: 1.0.2 (versionCode: 102)
- 目标平台: Android
- Git分支策略: master/dev/feature

## 常见问题

### 1. Token过期处理
- 自动检测401状态码
- 清除本地存储
- 跳转登录页

### 2. 网络异常处理
- 请求前网络检测
- 失败重试机制
- 友好错误提示

### 3. 兼容性问题
- Android不同版本适配（Android 5.0+）
- 不同厂商ROM兼容性处理
- 条件编译 `#ifdef APP-PLUS`

### 4. 大图加载
- 使用image组件mode属性
- 懒加载策略
- CDN加速

### 5. 第三方签章服务异常
- **问题**: 签章接口调用失败
- **原因**: 第三方服务不可用或网络问题
- **解决**: 
  - 检查网络连接
  - 确认第三方服务状态
  - 实施重试机制
  - 提供降级方案（稍后签署）

## 开发规范

### 代码规范
- 使用Vue 3 Composition API
- 组件命名: PascalCase
- 文件命名: camelCase
- 注释使用中文

### Git规范
- commit message清晰明了
- 功能分支开发
- Code Review机制

### 命名规范
- 变量: camelCase
- 常量: UPPER_SNAKE_CASE
- 组件: PascalCase
- CSS类: kebab-case

## 未来规划

### 功能扩展
- [ ] 在线处方流转
- [ ] 医保支付对接
- [ ] 家庭医生服务
- [ ] 健康管理计划
- [ ] 社区互动功能
- [ ] 多语言扩展

### 技术升级
- [ ] Vue 3最新特性应用
- [ ] TypeScript迁移
- [ ] 微前端架构
- [ ] SSR服务端渲染
- [ ] PWA支持

### 性能提升
- [ ] 首屏加载优化
- [ ] 缓存策略完善
- [ ] 离线功能支持
- [ ] 动画性能优化

## 联系方式

**技术支持**: [待补充]
**问题反馈**: [待补充]
**文档维护**: 开发团队

---

*最后更新时间: 2026-05-15*
*文档版本: v1.0*

