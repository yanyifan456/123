import request from "@/utils/request.js";
export const code = (data) => {
	return request({
		url: "/medicine/getverifyUserCode",
		method: "POST",
		data,
	});
};
export const jdqueryorderdetail = (data) => {
	return request({
		url: "/third/jdorderquerytrace",
		method: "POST",
		data,
	});
};
export const login = (data) => {
	return request({
		url: "/appmedicine/loginWithCode",
		method: "POST",
		data,
	});
};
export const countryList = (data) => {
	return request({
		url: "/country/code/select/countryList",
		method: "POST",
		data,
	});
};
export const selectCaseList = (data) => {
	return request({
		url: "/mini/userCase/selectUserCaseList",
		method: "POST",
		data,
	});
};

export const selectCaseDetail = (data) => {
	return request({
		url: "/mini/userCase/selectUserCaseDetail",
		method: "POST",
		data,
	});
};
export const signature = (data) => {
	return request({
		url: "/third/person/signature",
		method: "POST",
		data,
	});
};
export const contract = (data) => {
	return request({
		url: "/third/signature/contract",
		method: "POST",
		data,
	});
};
export const templete = (data) => {
	return request({
		url: "/third/signature/templete",
		method: "POST",
		data,
	});
};
export const jiaoyan = (data) => {
	return request({
		url: "/appmedicine/faceVerifyAfterLogin",
		method: "POST",
		data,
	});
};
export const leiixng = (data) => {
	return request({
		url: "/acceptmidorderuser/listCertType",
		method: "POST",
		data,
	});
};
// 实名认证提交
export const appId2Verify = (userInfo, frontImg, backImg) => {
	return new Promise((resolve, reject) => {
		// const url = "http://192.168.100.14:18085/appmedicine/auth/appId2Verify"
		const url =
			"https://hqgy.gzxinxingyiyuan.com/api/appmedicine/auth/appId2Verify";
		const token = uni.getStorageSync("token");
		const userInfoStr = JSON.stringify(userInfo);

		// 境外身份证 → 有文件
		if (frontImg && backImg) {
			Promise.all([fileToBlob(frontImg), fileToBlob(backImg)])
				.then(([frontBlob, backBlob]) => {
					const formData = new FormData();
					formData.append("userInfoStr", userInfoStr);
					formData.append("front", frontBlob, "front.jpg");
					formData.append("back", backBlob, "back.jpg");

					const xhr = new XMLHttpRequest();
					xhr.open("POST", url);
					xhr.setRequestHeader("Authorization", `Bearer ${token}`);
					xhr.onload = () =>
						xhr.status === 200 ?
						resolve(JSON.parse(xhr.responseText)) :
						reject(xhr.responseText);
					xhr.onerror = () => reject("网络异常");
					xhr.send(formData);
				})
				.catch(reject);
		} else {
			// 大陆身份证 → 只传 JSON
			uni.request({
				url,
				method: "POST",
				header: {
					Authorization: token ? `Bearer ${token}` : "",
					"content-type": "application/json",
				},
				data: JSON.stringify({
					userInfoStr,
				}),
				success: (res) => resolve(res.data),
				fail: (err) => reject(err),
			});
		}
	});
};
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
export const getreciveaddress = (data) => {
	return request({
		url: "/mini/user/getreciveaddress",
		method: "POST",
		data,
	});
};
export const addreciveaddress = (data) => {
	return request({
		url: "/mini/user/addreciveaddress",
		method: "POST",
		data,
	});
};
export const getregiontree = (data) => {
	return request({
		url: "/country/code/select/getregiontree",
		method: "POST",
		data,
	});
};
export const updreciveaddress = (data) => {
	return request({
		url: "/mini/user/updreciveaddress",
		method: "POST",
		data,
	});
};
export const getexpenditure = (data) => {
	return request({
		url: "/acceptexpenditure/getexpenditure",
		method: "POST",
		data,
	});
};
export const updexpenditure = (data) => {
	return request({
		url: "/acceptexpenditure/updexpenditure",
		method: "POST",
		data,
	});
};
export const selectfeedbacklist = (data) => {
	return request({
		url: "/appfeedback/selectfeedbacklist",
		method: "POST",
		data,
	});
};
export const addfeedback = (data) => {
	return request({
		url: "/appfeedback/addfeedback",
		method: "POST",
		data,
	});
};
export const updatefeedback = (data) => {
	return request({
		url: "/appfeedback/updatefeedback",
		method: "POST",
		data,
	});
};
export const selectfeedbackdetail = (data) => {
	return request({
		url: "/appfeedback/selectfeedbackdetail",
		method: "POST",
		data,
	});
};

export const deleteRecord = (data) => {
	return request({
		url: "/mini/userCase/deleteUserCase",
		method: "POST",
		data,
	});
};
export const getRecordDetail = (data) => {
	return request({
		url: "/mini/userCase/selectUserCaseDetail",
		method: "POST",
		data,
	});
};
export const init = (data) => {
	return request({
		url: "/verify/init",
		method: "POST",
		data,
	});
};
export const results = (data) => {
	return request({
		url: "/verify/result",
		method: "POST",
		data,
	});
};

export const editRecordDetail = (data) => {
	return request({
		url: "/mini/userCase/updateUserCase",
		method: "POST",
		data,
	});
};
export const deptCode = (data) => {
	return request({
		url: "/medicine/org/selectOrg",
		method: "POST",
		data,
	});
};
// ================= 客服聊天相关接口 =================
// 聊天接口的基础 URL
const CHAT_BASE_URL = "https://hqgy.gzxinxingyiyuan.com/api";

// 获取聊天历史记录
export const getChatHistory = (data) => {
	return request({
			url: "/chat/history",
			method: "post",
			data,
		},
		CHAT_BASE_URL,
	);
};

// 发送聊天消息
export const sendChatMessage = (data) => {
	return request({
			url: "/chat/send",
			method: "POST",
			data,
		},
		CHAT_BASE_URL,
	);
};
export const aaa = (data) => {
	return request({
			url: "/chat/customer/service/online",
			method: "POST",
			data,
		},
		CHAT_BASE_URL,
	);
};
// WebSocket 连接配置
export const WS_URL = "https://hqgy.gzxinxingyiyuan.com/ws/chat";

// 连接 WebSocket
export const connectWebSocket = (
	userId,
	onOpen,
	onMessage,
	onClose,
	onError,
) => {
	const socketTask = uni.connectSocket({
		url: WS_URL + "?userId=" + userId,
		success: () => console.log("[WS] 连接中..."),
		fail: (err) => {
			console.error("[WS] 连接失败", err);
		},
	});

	socketTask.onOpen(onOpen);
	socketTask.onMessage(onMessage);
	socketTask.onClose(onClose);
	socketTask.onError(onError);

	return socketTask;
};