import request from "@/utils/request.js"


// const url = "https://doctor.gzxinxingyiyuan.com/ruoguapp"; // 测试
// const url = "https://www.ruoguzhichuang.com/api"; // 测试
// const url = "http://192.168.100.14:18085"; // 小李
const url = "http://192.168.100.4:18082"; // 老李 2.0

// 获取消息列表
export const getMsgList = (data) => {
	return request({
		url: "/msg/list",
		method: "POST",
		data,
	});
};

// 获取消息总数
export const getMsgCount = (data) => {
	return request({
		url: "/msg/count",
		method: "POST",
		data,
	});
};
// 获取消息详情
export const getMsgDetail = (data) => {
	return request({
		url: "/msg/msgDetailAndUpdate",
		method: "POST",
		data,
	});
};

// 获取医生列表
export const getDoctorList = (data) => {
	return request({
		url: "/mini/doctor/selectDoctorListByDoctorName",
		method: "POST",
		data,
	});
};

// 获取科室列表
export const getDepart = (data) => {
	return request({
		url: "/mini/depart/selectDepartList",
		method: "POST",
		data,
	});
};

// 按照科室差医生列表
export const getDoctorByDepart = (data) => {
	return request({
		url: "/mini/doctor/selectDoctorListByDepart",
		method: "POST",
		data,
	});
};

// 查询医生详情
export const getDoctorDetail = (data) => {
	return request({
		url: "/mini/doctor/selectDoctorDetail",
		method: "POST",
		data,
	});
};

// 新增预约单
export const createPayOrder = (data) => {
	return request({
		url: "/mini/acceptuserorder/adduserorder",
		method: "POST",
		data,
	});
};

/**
 * 修改预约单状态（待支付不用退款）
 * @param {Object} orderId
 * @param {String} orederState
 */
export const cancelOrderNotPay = (data) => {
	return request({
		url: "/mini/acceptuserorder/updateuserorder",
		method: "POST",
		data,
	});
};

/**
 * 修改预约单状态（支付后退款）
 * @param {Object} orderId
 * @param {String} orederState
 */
export const cancelOrderPay = (data) => {
	return request({
		url: "/mini/acceptuserorder/updateuserorderrefund",
		method: "POST",
		data,
	});
};

//预约费用查询
export const selectUserOrderList = (data) => {
	return request({
		url: "/mini/acceptuserorder/selectuserorderlist",
		method: "POST",
		data,
	});
};

/**
 * 获取echarts数据new
 * @param {Object} params
 * @param {String} params.userId 
 */
export const getEchartsDataNew = (params) => {
	return request({
		url: "/app/userDevice/getusercurmetric",
		method: "POST",
		data: params,
	}, url);
}


/**
 * 获取人体画像数据
 * @param {Object} params
 * @param {Number} params.userId
 */
export const getPersonal = (params) => {
	return request({
		url: "/app/userDevice/getuserAbnormalMetric",
		method: "POST",
		data: params,
	}, url);
};

/**
 * 立即解读
 * @param {Object} params
 */
export const getInterpretation = (params) => {
	return request({
		url: "/apphealth/qianwen/bigmodelstream",
		method: "POST",
		data: params,
		timeout: 1000 * 125,
	}, url);
};

/**
 * 获取手表8项数据
 * @param {Object} params
 * @param {String} params.userId
 * @param {String} params.deviceId
 */

export const getWatchDataApi = (params) => {
	return request({
		url: "/app/health/getHealthData",
		method: "POST",
		data: params,
	}, url);
};

/**
 * 根据类型获取具体手表数据
 * @param {Object} params
 * @param {String} params.deviceId
 * @param {String} params.userId
 * @param {String} params.type
 * @param {String} params.dataDate
 */

export const getWatchDataByType = (params) => {
	return request({
		url: "/app/health/getHealthDataDetailByType",
		method: "POST",
		data: params,
	}, url);
};

/**
 * 获取手表列表
 * @param {Object} params
 * @param {String} params.userId
 */
export const getWatchList = (params) => {
	return request({
		url: "/app/userDevice/getDeviceList",
		method: "POST",
		data: params,
	}, url);
};

/**
 * 获取当前用户历史解读时间
 * @param {Object} params
 * @param {String} params.userId
 */
export const getInterpretationTime = (params) => {
	return request({
		url: "/apphealth/select/historicalanomalylatest",
		method: "POST",
		data: params,
	}, url);
};

/**
 * 获取历史解读列表
 * @param {Object} params
 * @param {String} params.userId
 */
export const getInterpretationList = (params) => {
	return request({
		url: "/apphealth/select/historicalanomalylist",
		method: "POST",
		data: params,
	}, url);
};

/**
 * 查询历史异常解读详情数据
 * @param {Object} params
 * @param {String} params.id
 */
export const getInterpretationDetail = (params) => {
	return request({
		url: "/apphealth/select/historicalanomalydetail",
		method: "POST",
		data: params,
	}, url);
};

/**
 * 获取既往病史
 * @param {Object} params
 * @param {String} params.userId
 *
 */
export const getHistoryIll = (params) => {
	return request({
		url: "/health/getuserMedicalInfo",
		method: "POST",
		data: params,
	}, url);
};

//会诊记录列表
export const selectconsultationlist = (data) => {
	return request({
		url: "/mini/acceptuserorder/selectconsultationlist",
		method: "POST",
		data,
	});
};


// App查询药品列表
export const getMedicalList = (data) => {
	return request({
		url: "/app/midmedicine/selectMedicineList",
		method: "POST",
		data,
	})
}


// App查询药品分类列表
export const getMedicalType = (data) => {
	return request({
		url: "/app/midmedicine/selectMedicineTypeList",
		method: "POST",
		data,
	})
}


// 查询药品详情
export const getMedicalDetail = (data) => {
	return request({
		url: "/midmedicine/selectMedicineDetail",
		method: "POST",
		data,
	})
}

// 新增购物车
export const addToCart = (data) => {
	return request({
		url: "/shopping/addShopCart",
		method: "POST",
		data,
	})
}

// 购物车列表
export const getCartList = (data) => {
	return request({
		url: "/shopping/getshopcart",
		method: "POST",
		data,
	})
}

// 修改购物车数量
export const updataCartNum = (data) => {
	return request({
		url: "/shopping/updShopCart",
		method: "POST",
		data,
	})
}

// 修改购物车数量
export const updataCartCheck = (data) => {
	return request({
		url: "/shopping/seltagShopCart",
		method: "POST",
		data,
	})
}

// 修改购物车数量
export const deleteCart = (data) => {
	return request({
		url: "/shopping/delShopCart",
		method: "POST",
		data,
	})
}

// 查询选中商品
export const getSelectedShopList = (data) => {
	return request({
		url: "/shopping/selectseltagshoplist",
		method: "POST",
		data,
	})
}

// 查询收货地址列表
export const getAddressList = (data) => {
	return request({
		url: "/mini/user/getreciveaddress",
		method: "POST",
		data,
	})
}

// 新增交易记录
export const createTradeInfo = (data) => {
	return request({
		url: "/acceptexpenditure/addexpenditure",
		method: "POST",
		data,
	})
}

// 查看建议详情
export const getPrescriptionDetai = (data) => {
	return request({
		url: "/mini/acceptuserorder/selectprescriptiondetail",
		method: "POST",
		data,
	})
}
// 查看处方详情
export const getSuggestionDetai = (data) => {
	return request({
		url: "/acceptpharmacy/selectPharmacyAuditDetail",
		method: "POST",
		data,
	})
}

// 新增病历
export const createCase = (data) => {
	return request({
		url: "/mini/userCase/insertUserCase",
		method: "POST",
		data,
	})
}

// APP查询医生排班时间
export const checkDoctorSchedule = (data) => {
	return request({
		url: "/appmedicine/selectApp/doctor/schedule/choice/time",
		method: "POST",
		data,
	})
}

// APP查询医生可预约时间段详情
export const checkDoctorScheduleDetail = (data) => {
	return request({
		url: "/appmedicine/selectApp/doctors/availability",
		method: "POST",
		data,
	})
}

// 支付接口
export const wechatPay = (data) => {
	return request({
		url: "/third/hqmedicine/wpay",
		method: "POST",
		data,
	})
}
export const AliPay = (data) => {
	return request({
		url: "/third/zhifubao/wpay",
		method: "POST",
		data,
	})
}

// 新增交易流水
export const addPayOrder = (data) => {
	return request({
		url: "/mini/acceptuserorder/insertpay",
		method: "POST",
		data,
	})
}

// 用户点击去购药
export const userClickToPurchaseMedicine = (data) => {
	return request({
		url: "/acceptmidorderuser/updateMidUserOrder",
		method: "POST",
		data,
	})
}