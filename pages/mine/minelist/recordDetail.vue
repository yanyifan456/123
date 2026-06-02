<template>
	<view class="page pages">
		<view v-if="props.type == 'edit'" class="check-result">
			<view class="">*审核不通过</view>
			<view class="">{{ checkResult }}</view>
		</view>
		<view class="card1">
			<view class="title">
				<view class="mark"></view>
				<view class="title-text">病历</view>
			</view>
			<view class="text-area">
				<up-textarea
					border="surround"
					v-model="historyCase"
					count
					placeholder="请输入内容"
					autoHeight
					class="textarea-box"
				></up-textarea>
				<up-upload
					accept="image"
					:fileList="fileList1"
					@afterRead="afterRead"
					@delete="deletePic"
					name="1"
					multiple
					:maxCount="50"
					:previewFullImage="false"
				></up-upload>
			</view>
		</view>
		<view class="card2">
			<view class="title">
				<view class="mark"></view>
				<view class="title-text">诊断书</view>
			</view>
			<view class="text-area">
				<up-textarea
					border="surround"
					v-model="historyDiagnosis"
					count
					placeholder="请输入内容"
					autoHeight
					class="textarea-box"
				></up-textarea>
				<up-upload
					accept="image"
					:fileList="fileList2"
					@afterRead="afterRead"
					@delete="deletePic"
					name="2"
					multiple
					:maxCount="50"
					:previewFullImage="false"
				></up-upload>
			</view>
		</view>
		<view class="card3">
			<view class="title">
				<view class="mark"></view>
				<view class="title-text">检查报告</view>
			</view>
			<view class="text-area">
				<up-textarea
					border="surround"
					v-model="historyReport"
					count
					placeholder="请输入内容"
					autoHeight
					class="textarea-box"
				></up-textarea>
				<up-upload
					accept="image"
					:fileList="fileList3"
					@afterRead="afterRead"
					@delete="deletePic"
					name="3"
					multiple
					:maxCount="50"
					:previewFullImage="false"
				></up-upload>
			</view>
		</view>
		<view class="bottom-box">
			<view class="bottom-btn" @click="submit">确定</view>
		</view>
	</view>
</template>
<script setup>
import { reactive, ref } from "vue";
import { createCase } from "@/api/base.js";
import { editRecordDetail } from "@/api/yyf.js";
import axios from "axios";

import { onLoad, onUnload } from "@dcloudio/uni-app";

const props = reactive({});

const historyCase = ref("");
const historyDiagnosis = ref("");
const historyReport = ref("");

const checkResult = ref("");

// 上传列表
const fileList1 = ref([]);
const fileList2 = ref([]);
const fileList3 = ref([]);

// 手机号
const phone = uni.getStorageSync("phone");

/**
 * 图片解密
 * 返回 blob url
 */
const decryption = (url) => {
	return new Promise((resolve) => {
		uni.request({
			url: "https://hqgy.gzxinxingyiyuan.com/filedec/file/desfile/download",

			method: "GET",

			data: {
				url,
			},

			// ⭐ 必须
			responseType: "arraybuffer",

			success: (res) => {
				try {
					// arraybuffer 转 base64
					const base64 = uni.arrayBufferToBase64(res.data);

					// ⭐ 生成图片地址
					const imgUrl = `data:image/png;base64,${base64}`;

					resolve(imgUrl);
				} catch (err) {
					console.log("转换失败", err);

					resolve("");
				}
			},

			fail: (err) => {
				console.log("解密失败", err);

				resolve("");
			},
		});
	});
};

/**
 * 转换图片列表
 * 后端返回：
 * ["加密url1","加密url2"]
 *
 * 转成：
 * [
 *   {
 *      url: blobUrl,
 *      originUrl: encryptUrl
 *   }
 * ]
 */
const formatFileList = async (listStr) => {
	if (!listStr) return [];

	let arr = [];

	try {
		arr = JSON.parse(listStr);
		console.log(arr);
	} catch (e) {
		return [];
	}

	const result = [];

	for (const item of arr) {
		const imgUrl = await decryption(item);

		result.push({
			url: imgUrl, // 展示
			originUrl: item, // 真正提交给后端
			type: "image",
			status: "success",
		});
	}

	return result;
};

onLoad((options) => {
	props.type = options.type;
	props.orderId = options.orderId;
	props.orderUserId = options.orderUserId;

	initData();
});
const initData = async () => {
	const data = uni.getStorageSync("medicalRecord");

	console.log("缓存数据", data);

	if (!data) return;

	try {
		checkResult.value = data.checkResult || "";

		historyCase.value = data.historyCase || "";
		historyDiagnosis.value = data.historyDiagnosis || "";
		historyReport.value = data.historyReport || "";

		// ⭐ 等待图片解密
		fileList1.value = await formatFileList(data.casePhoto);

		console.log("fileList1", fileList1.value);

		fileList2.value = await formatFileList(data.diagnosisPhoto);

		fileList3.value = await formatFileList(data.reportPhoto);
	} catch (error) {
		//TODO handle the exception
		console.log(error);
	}
};

/**
 * 页面卸载时释放 blob
 */
onUnload(() => {
	[fileList1.value, fileList2.value, fileList3.value].flat().forEach((item) => {
		if (item.url?.startsWith("blob:")) {
			URL.revokeObjectURL(item.url);
		}
	});

	if (props.type) {
		uni.setStorageSync("medicalRecord", {});
	}
});

/**
 * 上传图片
 */
const uploadFile = (filePath) => {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			// 正确写法
			// url: "http://hqgy.gzxinxingyiyuan.com:8085/file/casephoto",
			url: "https://hqgy.gzxinxingyiyuan.com/filedec/file/casephoto",

			filePath,
			name: "file",

			formData: {
				serialNumber: phone,
			},

			success: (res) => {
				try {
					const data = JSON.parse(res.data);
					console.log(data);
					resolve(data);
				} catch (err) {
					console.log(err);
					reject(err);
				}
			},

			fail: (err) => {
				console.log("上传失败", err);

				uni.showToast({
					title: err.errMsg || "上传失败",
					icon: "none",
				});

				reject(err);
			},
		});
	});
};

/**
 * 读取文件后上传
 */
const afterRead = async (event) => {
	let { file, name } = event;

	let files = [].concat(file);

	for (let item of files) {
		try {
			// 上传
			const res = await uploadFile(item.url);

			// 后端返回的加密地址
			const realUrl = res.data.data;

			// 解密得到 blob
			const blobUrl = await decryption(realUrl);

			const fileObj = {
				url: blobUrl, // 展示
				originUrl: realUrl, // 提交给后端
				status: "success",
				type: "image",
			};

			if (name == 1) {
				fileList1.value.push(fileObj);
			} else if (name == 2) {
				fileList2.value.push(fileObj);
			} else if (name == 3) {
				fileList3.value.push(fileObj);
			}
		} catch (err) {
			console.log("上传失败", err);
		}
	}
};

/**
 * 删除图片
 */
const deletePic = (event) => {
	let { index, name } = event;

	const removeAndRelease = (list) => {
		const item = list[index];

		if (item?.url?.startsWith("blob:")) {
			URL.revokeObjectURL(item.url);
		}

		list.splice(index, 1);
	};

	if (name == 1) {
		removeAndRelease(fileList1.value);
	} else if (name == 2) {
		removeAndRelease(fileList2.value);
	} else if (name == 3) {
		removeAndRelease(fileList3.value);
	}
};

/**
 * 校验
 */
const validMethod = () => {
	const casePhoto = fileList1.value.map((item) => item.originUrl);

	const diagnosisPhoto = fileList2.value.map((item) => item.originUrl);

	const reportPhoto = fileList3.value.map((item) => item.originUrl);

	if (casePhoto.length == 0) {
		uni.showToast({
			title: "请上传病历图片",
			icon: "none",
		});

		return false;
	}

	if (diagnosisPhoto.length == 0) {
		uni.showToast({
			title: "请上传诊断图片",
			icon: "none",
		});

		return false;
	}

	if (reportPhoto.length == 0) {
		uni.showToast({
			title: "请上传检查报告图片",
			icon: "none",
		});

		return false;
	}

	return true;
};

/**
 * 提交
 */
const submit = async () => {
	try {
		if (!validMethod()) return;

		// ⭐ 提交原始加密地址
		const casePhoto = fileList1.value.map((item) => item.originUrl);

		const diagnosisPhoto = fileList2.value.map((item) => item.originUrl);

		const reportPhoto = fileList3.value.map((item) => item.originUrl);

		const params = {
			historyCase: historyCase.value,
			historyDiagnosis: historyDiagnosis.value,
			historyReport: historyReport.value,

			casePhoto: JSON.stringify(casePhoto),

			diagnosisPhoto: JSON.stringify(diagnosisPhoto),

			reportPhoto: JSON.stringify(reportPhoto),
		};

		// 编辑
		if (props.type == "edit") {
			const editRes = await editRecordDetail({
				...params,
				orderId: props.orderId,
				orderState: 6,
			});

			if (editRes.code == 200) {
				uni.setStorageSync("medicalRecord", {});

				uni.showToast({
					title: "编辑成功",
					icon: "none",
					mask: true,
				});

				uni.navigateBack();
			}
		}

		// 新增
		if (props.type == "add") {
			const res = await createCase({
				...params,
				orderId: props.orderId,
				userId: props.orderUserId,
			});

			if (res.code == 200) {
				uni.showToast({
					title: "新增成功",
					icon: "none",
				});

				uni.navigateBack();
			}
		}
	} catch (error) {
		console.log(error);

		uni.showToast({
			title: "提交失败",
			icon: "none",
		});
	}
};
</script>
<style scoped lang="scss">
.pages {
	padding: 32rpx 48rpx 208rpx;
}

.card1,
.card2,
.card3 {
	margin-bottom: 32rpx;

	.title {
		@include flex-start;

		.mark {
			width: 4rpx;
			height: 28rpx;
			border-radius: 4rpx;
			background-color: $primary-light;
			margin-right: 16rpx;
		}

		.title-text {
			font-weight: bold;
			font-size: 28rpx;
			color: $text-primary;
		}
	}

	.text-area {
		padding: 32rpx;
		width: 654rpx;
		// height: 268rpx;
		background: #ffffff;
		box-shadow: $box-shadow;
		border-radius: 20rpx;
		margin-top: 24rpx;

		.textarea-box {
			// margin-top: 24rpx;
			// border: 1px solid $border-color;
			padding: 0;
			// height: 200rpx;
			color: $text-regular;
			line-height: 1;
			font-size: 24rpx;
			margin-bottom: 24rpx;
		}
	}
}

.bottom-box {
	width: 100%;
	height: 200rpx;
	background-color: #ffffff;
	position: fixed;
	bottom: 0;
	padding: 20rpx 48rpx;
	left: 0;
	z-index: 99;

	.bottom-btn {
		@include flex-center;
		width: 100%;
		height: 92rpx;
		background: $primary-light;
		border-radius: 20rpx;
		color: #ffffff;
		font-weight: bold;
		font-size: 28rpx;
	}
}

.check-result {
	height: fit-content;
	width: 100%;
	border: 1px solid rgba($danger, 1);
	padding: 24rpx;
	color: #434343;
	font-size: 24rpx;
	border-radius: 20rpx;
	background-color: rgba($danger, 0.1);
	margin-bottom: 32rpx;
	> :nth-child(1) {
		color: rgba($danger, 1);
		font-size: 28rpx;
		margin-bottom: 16rpx;
	}
}
</style>
