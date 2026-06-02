<template>
	<view class="page pages">
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
					:fileList="fileList1"
					@afterRead="afterRead"
					@delete="deletePic"
					name="1"
					multiple
					:maxCount="3"
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
					:fileList="fileList2"
					@afterRead="afterRead"
					@delete="deletePic"
					name="2"
					multiple
					:maxCount="3"
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
					:fileList="fileList3"
					@afterRead="afterRead"
					@delete="deletePic"
					name="3"
					multiple
					:maxCount="3"
				></up-upload>
			</view>
		</view>
		<view class="bottom-box">
			<view class="bottom-btn" @click="submit">确定/ 编辑提交</view>
		</view>
	</view>
</template>
<script setup>
import { ref, reactive } from "vue";
import { createCase } from "@/api/base.js";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getRecordDetail, editRecordDetail } from "@/api/yyf.js";
const props = reactive({});
onLoad(({ id }) => {
	props.id = id;
	getDetail(id);
});
const detail = reactive({});
const getDetail = async (id) => {
	try {
		const params = { id };
		console.log(params);
		const res = await getRecordDetail(params);

		historyCase.value = res.data.data.historyCase || "";

		historyDiagnosis.value = res.data.data.historyDiagnosis || "";

		historyReport.value = res.data.data.historyReport || "";
		const caseArr = JSON.parse(res.data.data.casePhoto || "[]");
		const diagnosisArr = JSON.parse(res.data.data.diagnosisPhoto || "[]");
		const reportArr = JSON.parse(res.data.data.reportPhoto || "[]");

		fileList1.value = caseArr.map((url) => ({
			url,
			status: "success",
			data: url,
		}));

		fileList2.value = diagnosisArr.map((url) => ({
			url,
			status: "success",
			data: url,
		}));

		fileList3.value = reportArr.map((url) => ({
			url,
			status: "success",
			data: url,
		}));

		console.log(res);
	} catch (error) {
		//TODO handle the exception
		console.log(error);
	}
};

const historyCase = ref("");
const historyDiagnosis = ref("");
const historyReport = ref("");

// 三个上传列表（不要混用！！）
const fileList1 = ref([]);
const fileList2 = ref([]);
const fileList3 = ref([]);

// 获取手机号
const phone = uni.getStorageSync("phone");

/**
 * 上传图片
 */
const uploadFile = (filePath) => {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: "http://hqgy.gzxinxingyiyuan.com:8085/file/casephoto",
			filePath: filePath,
			name: "file",
			formData: {
				serialNumber: phone,
			},
			success: (res) => {
				const data = JSON.parse(res.data);
				console.log(data);
				resolve(data);
			},
			fail: (err) => {
				console.log(err);
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

	// 统一转数组
	let files = [].concat(file);

	for (let item of files) {
		try {
			const res = await uploadFile(item.url);
			console.log(res);
			const fileObj = {
				url: item.url,
				status: "success",
				...res.data, // 后端返回的地址
			};

			// 根据不同区域存
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

	if (name == 1) {
		fileList1.value.splice(index, 1);
	} else if (name == 2) {
		fileList2.value.splice(index, 1);
	} else if (name == 3) {
		fileList3.value.splice(index, 1);
	}
};

const submit = async () => {
	try {
		console.log(fileList1.value, fileList2.value, fileList3.value);
		const casePhoto = fileList1.value.map((item) => item.data);
		const diagnosisPhoto = fileList2.value.map((item) => item.data);
		const reportPhoto = fileList3.value.map((item) => item.data);
		const params = {
			historyCase: historyCase.value,
			historyDiagnosis: historyDiagnosis.value,
			historyReport: historyReport.value,
			casePhoto: JSON.stringify(casePhoto), // 病例图片
			diagnosisPhoto: JSON.stringify(diagnosisPhoto), // 诊断图片
			reportPhoto: JSON.stringify(reportPhoto), // 检查报告图片
			userId: uni.getStorageSync("userId"),
			id: props.id,
		};
		console.log(params);
		const res = await editRecordDetail(params);
		return;
		uni.showToast({
			title: "新增成功",
			icon: "none",
		});
	} catch (error) {
		//TODO handle the exception
	} finally {
		// uni.navigateBack();
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
</style>
