<template>
	<view class="container person-info">
		<view class="content">
			<view class="avatar-box">
				<up-cell :border="false">
					<template #title>
						<view class="fs-28 color-373738">頭像</view>
					</template>
					<template #value>
						<view class="avatar-btn" @click="onChooseAvatar">
							<up-avatar size="50"
								:src="formData.profilePicture || 'https://uview-plus.jiangruyi.com/album/2.jpg'"></up-avatar>
						</view>
					</template>
				</up-cell>
			</view>

			<view class="form-box box-mt-24">
				<up-form :model="formData" ref="uFormRef" labelPosition="left" labelWidth="auto">
					<up-form-item label="姓名" prop="userName" borderBottom="true">
						<up-input disabled v-model="formData.userName" border="none" clearable inputAlign="right"
							placeholder="請輸入真實姓名" fontSize="14px" color="#979698" />
					</up-form-item>

					<up-form-item label="性別" prop="sex" borderBottom="true">
						<up-radio-group v-model="formData.sex" placement="row">
							<up-radio :customStyle="{ marginBottom: '8px' }" v-for="(item, index) in radiolist"
								:key="item.id" :label="item.name" :name="item.value" @change="radioChange"
								labelColor="#979698" labelSize="14px" activeColor="#459767"></up-radio>
						</up-radio-group>
					</up-form-item>

					<up-form-item label="出生日期" prop="birthyDay" borderBottom="true">
						<up-cell :border="false" isLink @click="openBirthDayPicker">
							<template #value>
								<view class="fs-28 color-979698">
									{{ formData.birthyDay || "請選擇出生日期" }}
								</view>
							</template>
						</up-cell>
					</up-form-item>

					<up-form-item label="身高" prop="height" borderBottom="true">
						<up-cell :border="false" isLink @click="openHeightPicker">
							<template #value>
								<view class="fs-28 color-979698">
									{{ formData.height ? formData.height + "cm" : "請選擇身高" }}
								</view>
							</template>
						</up-cell>
					</up-form-item>

					<up-form-item label="體重" prop="weight" borderBottom="true">
						<up-cell :border="false" isLink @click="openWeightPicker">
							<template #value>
								<view class="fs-28 color-979698">
									{{ formData.weight ? formData.weight + "kg" : "請選擇體重" }}
								</view>
							</template>
						</up-cell>
					</up-form-item>

					<up-form-item label="綁定手機號" prop="phone" borderBottom="true">
						<up-input v-model="formData.phone" border="none" inputAlign="right" placeholder="請輸入手機號"
							type="number" fontSize="14px" color="#979698" inputmode="numeric" maxlength="11" disabled
							disabledColor="#fff" />
					</up-form-item>

					<!-- 有orgName时显示机构名称（只读） -->
					<up-form-item v-if="hasOrgName" label="機構名稱" prop="orgName" borderBottom="true">
						<up-input v-model="formData.orgName" border="none" inputAlign="right" placeholder=""
							fontSize="14px" color="#979698" disabled disabledColor="#fff" />
					</up-form-item>

					<!-- 没有orgName时显示机构编码（可编辑） -->
					<up-form-item v-else label="機構編碼" prop="jgbm" borderBottom="true">
						<up-input v-model="formData.jgbm" border="none" inputAlign="right" placeholder="請輸入機構編碼"
							fontSize="14px" color="#979698" inputmode="numeric" />
					</up-form-item>

					<up-form-item label="使用數據協議" prop="jgbm" borderBottom="true" v-if="isWrite == 1">
						<up-cell :border="false" isLink @click="gosjsy">
							<template #value>
								<view class="fs-28 color-979698">
									{{ formData.sjxy }}
								</view>
							</template>
						</up-cell>
					</up-form-item>
					<up-form-item label="個人詳細地址" prop="region" borderBottom="true">
						<up-cell :border="false" isLink @click="openAddPicker">
							<template #value>
								<view class="fs-28 color-979698">
									{{ formData.region || "請選擇省/市/區" }}
								</view>
							</template>
						</up-cell>
					</up-form-item>

					<textarea v-model="formData.detailAddress" placeholder="請輸入您的真實詳細地址（藥品能寄到）" style="
							width: 100%;
							height: 150rpx;
							padding: 8rpx;
							padding-top: 30rpx;
							font-size: 14px;
							color: #979698;
							border: none;
							box-sizing: border-box;
							resize: none;
						" @input="autoHeight($event)"></textarea>
				</up-form>
			</view>

			<!-- 身份證信息 -->
			<view class="form-box box-mt-24">
				<up-form :model="formData" labelPosition="left" labelWidth="auto">
					<up-form-item label="身份證號碼" prop="idCard" borderBottom="true">
						<up-input disabled v-model="formData.idCard" border="none" clearable inputAlign="right"
							placeholder="請輸入真實身份證號碼" fontSize="14px" color="#979698" />
					</up-form-item>
				</up-form>

				<!-- 身份證上傳 -->
				<view class="id-card-upload">
					<view class="upload-item" @click="chooseIdCard('front')" style="margin-right: 30rpx">
						<view class="upload-img-wrapper">
							<image v-if="formData.frontImg" :src="formData.frontImg" mode="aspectFill"
								class="id-card-img" />
							<view v-else class="upload-placeholder">
								<image src="/static/img/8.png" mode="aspectFit" class="placeholder-icon" />
							</view>
						</view>
						<text class="upload-text">身份證人像面</text>
					</view>
					<view class="upload-item" @click="chooseIdCard('back')">
						<view class="upload-img-wrapper">
							<image v-if="formData.backImg" :src="formData.backImg" mode="aspectFill"
								class="id-card-img" />
							<view v-else class="upload-placeholder">
								<image src="/static/img/9.png" mode="aspectFit" class="placeholder-icon" />
							</view>
						</view>
						<text class="upload-text">身份證國徽面</text>
					</view>
				</view>

				<view class="upload-tips">
					<text class="tips-text">
						溫馨提示：務必上傳證件
						<text style="color: #ff4c10">（正上方）</text>
						，圖像清晰，否則審核不通過！
					</text>
				</view>
			</view>

			<!-- 既往病史 -->
			<view class="form-box box-mt-24">
				<view class="medical-title">既往病史</view>
				<textarea v-model="formData.phm" placeholder="請輸入您的病歷史" style="
						width: 100%;
						height: 150rpx;
						padding: 8rpx;
						font-size: 14px;
						color: #979698;
						border: none;
						box-sizing: border-box;
						resize: none;
					"></textarea>
			</view>

			<!-- 過敏史 -->
			<view class="form-box box-mt-24">
				<view class="medical-title">過敏史</view>
				<textarea v-model="formData.allergyHistory" placeholder="請輸入您的過敏史" style="
						width: 100%;
						height: 150rpx;
						padding: 8rpx;
						font-size: 14px;
						color: #979698;
						border: none;
						box-sizing: border-box;
						resize: none;
					"></textarea>
			</view>

			<!-- 用藥史 -->
			<view class="form-box box-mt-24">
				<view class="medical-title">用藥史</view>
				<textarea v-model="formData.medHistory" placeholder="請輸入您的用藥史" style="
						width: 100%;
						height: 150rpx;
						padding: 8rpx;
						font-size: 14px;
						color: #979698;
						border: none;
						box-sizing: border-box;
						resize: none;
					"></textarea>
			</view>
		</view>

		<view class="bottom-btn">
			<view class="btn">
				<view class="fs-28 color-fff saveBtn" @click="openShowTip">保存</view>
			</view>
		</view>

		<!-- 地址選擇器 -->
		<up-picker ref="uPickerRef" :show="show" :columns="columns" cancelText="取消" confirmText="確定"
			cancelColor="#373738" confirmColor="#459767" closeOnClickOverlay @confirm="confirmPicker"
			@change="changePicker" @cancel="cancelPicker" @close="closePicker"></up-picker>

		<!-- 出生日期選擇器 -->
		<up-datetime-picker :show="showBirthDayPicker" v-model="birthyDayValue" mode="date" :minDate="minBirthDate"
			:maxDate="maxBirthDate" cancelText="取消" confirmText="確定" cancelColor="#373738" confirmColor="#459767"
			@confirm="confirmBirthDay" @cancel="cancelBirthDay" @close="cancelBirthDay"></up-datetime-picker>

		<!-- 身高選擇器 -->
		<up-picker :show="showHeightPicker" :columns="heightColumns" cancelText="取消" confirmText="確定"
			cancelColor="#373738" confirmColor="#459767" closeOnClickOverlay @confirm="confirmHeight"
			@cancel="cancelHeight" @close="cancelHeight"></up-picker>

		<!-- 體重選擇器 -->
		<up-picker :show="showWeightPicker" :columns="weightColumns" cancelText="取消" confirmText="確定"
			cancelColor="#373738" confirmColor="#459767" closeOnClickOverlay @confirm="confirmWeight"
			@cancel="cancelWeight" @close="cancelWeight"></up-picker>
	</view>
	<up-popup v-model:show="showTip" closeable>
		<view class="popup-box">
			<view class="popup-title">隱私確認</view>
			<view class="popup-text">
				<view>根據《個人信息保護法》，我們將在以下範圍內收集、使用您的個人信息：</view>
				<view>1. 診療所需的身份信息、健康信息、醫療記錄。</view>
				<view>2. 用於改進服務的匿名化統計數據。</view>
				<view>3. 法律法規要求的其他情形。</view>
				<view>點擊"確認"即表示您同意上述個人信息處理方式。</view>
			</view>
		</view>
		<view class="popup-bottom">
			<view class="popup-btn-cancel" @click="closeShowTip">取消</view>
			<view class="popup-btn" @click="submitShowTip">確定</view>
		</view>
	</up-popup>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { showToast } from "@/utils/feedback";
import { areaData } from "@/utils/china_area.js";
import { getuserxiugai, getuser, deptCode } from "@/api/yyf.js";
import { BASE_URL } from "@/utils/setting.js";
import { onShow } from "@dcloudio/uni-app";
const uFormRef = ref(null);
const formData = ref({
	userName: "",
	sex: "1",
	phone: "",
	region: "",
	detailAddress: "",
	idCard: "",
	profilePicture: "",
	frontImg: "",
	backImg: "",
	birthyDay: "",
	height: "",
	weight: "",
	phm: "",
	allergyHistory: "",
	medHistory: "",
	jgbm: "",
	orgName: "",
	sjxy: "立即查看",
});

// 判断是否有orgName
const hasOrgName = ref(false);

// 存储机构编码校验后返回的 orgId
const orgId = ref(null);

const selectedCountryRegion = ref(null);
const selectedProvince = ref(null);
const selectedCity = ref(null);
const selectedDistrict = ref(null);
const radiolist = reactive([
	{
		name: "男",
		disabled: false,
		value: "1",
		id: 1,
	},
	{
		name: "女",
		disabled: false,
		value: "0",
		id: 2,
	},
]);

// ========== 出生日期選擇器 ==========
const showBirthDayPicker = ref(false);
const birthyDayValue = ref(new Date().getTime());
const minBirthDate = new Date("1900-01-01").getTime();
const maxBirthDate = new Date().getTime();
const openBirthDayPicker = () => (showBirthDayPicker.value = true);
const cancelBirthDay = () => (showBirthDayPicker.value = false);
const confirmBirthDay = ({ value }) => {
	const date = new Date(value);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	formData.value.birthyDay = `${year}-${month}-${day}`;
	showBirthDayPicker.value = false;
};

// ========== 身高選擇器 ==========
const showHeightPicker = ref(false);
const heightList = Array.from(
	{
		length: 121,
	},
	(_, i) => 100 + i + "cm",
);
const heightColumns = ref([heightList]);
const openHeightPicker = () => (showHeightPicker.value = true);
const cancelHeight = () => (showHeightPicker.value = false);
const confirmHeight = ({ value }) => {
	formData.value.height = value[0].replace("cm", "");
	showHeightPicker.value = false;
};

// ========== 體重選擇器 ==========
const showWeightPicker = ref(false);
const weightList = Array.from(
	{
		length: 121,
	},
	(_, i) => 30 + i + "kg",
);
const weightColumns = ref([weightList]);
const openWeightPicker = () => (showWeightPicker.value = true);
const cancelWeight = () => (showWeightPicker.value = false);
const confirmWeight = ({ value }) => {
	formData.value.weight = value[0].replace("kg", "");
	showWeightPicker.value = false;
};

// ========== 機構編碼失焦校驗 ==========
const handleDeptCodeBlur = async () => {
	// 如果已有orgName，则不需要校验机构编码
	if (hasOrgName.value) return true;

	if (!formData.value.jgbm) {
		showToast("請輸入機構編碼", 1500, "none");
		return false;
	}

	try {
		const res = await deptCode({ deptCode: formData.value.jgbm });
		console.log(res);
		if (res.code === "200" && res.data?.data?.length > 0) {
			orgId.value = res.data.data[0].orgId;
			return true; // 校验通过
		} else {
			orgId.value = null;
			showToast("編碼不正確", 1500, "none");
			return false; // 校验失败
		}
	} catch (err) {
		orgId.value = null;
		showToast("編碼不正確", 1500, "none");
		return false; // 校验失败
	}
};
const isWrite = ref(uni.getStorageSync("isWrite"));
const gosjsy = () => {
	console.log(666);
	const pdfUrl = uni.getStorageSync("consent");
	if (!pdfUrl) {
		uni.showToast({ title: "未找到文件链接", icon: "none" });
		return;
	}

	// 1. 下载文件
	uni.downloadFile({
		url: pdfUrl,
		success: (res) => {
			if (res.statusCode === 200) {
				// 2. 保存文件到手机本地（临时文件转为持久化文件）
				uni.saveFile({
					tempFilePath: res.tempFilePath,
					success: (saveRes) => {
						const savedFilePath = saveRes.savedFilePath;
						uni.showToast({ title: "下载成功", icon: "success" });

						// 可选：自动打开 PDF 预览，并允许用户另存到系统下载目录
						uni.openDocument({
							filePath: savedFilePath,
							success: () => {
								console.log("打开文档成功");
							},
							fail: (err) => {
								console.error("打开文档失败", err);
								// 若打开失败，至少提示文件已保存的路径
								uni.showModal({
									title: "已保存",
									content: `文件已保存到: ${savedFilePath}`,
									showCancel: false,
								});
							},
						});
					},
					fail: (err) => {
						console.error("保存文件失败", err);
						uni.showToast({ title: "保存失败", icon: "none" });
					},
				});
			} else {
				uni.showToast({ title: "下载失败，服务器错误", icon: "none" });
			}
		},
		fail: (err) => {
			console.error("下载失败", err);
			uni.showToast({ title: "网络错误或链接无效", icon: "none" });
		},
	});
};

// ========== 獲取用户信息 ==========
const getlist = async () => {
	const res = await getuser({
		serialNumber: uni.getStorageSync("phone"),
	});
	if (res.code === "200") {
		console.log(res);
		const data = res.data.data;
		formData.value.userName = data.userName;
		formData.value.sex = data.sex;
		formData.value.phone = data.serialNumber;
		formData.value.region = data.regions;
		formData.value.detailAddress = data.houseAddress;
		formData.value.profilePicture = data.profilePicture;
		formData.value.idCard = data.idCardNo;
		formData.value.frontImg = data.front;
		formData.value.backImg = data.back;
		formData.value.birthyDay = data.birthyDay || "";
		formData.value.height = data.height || "";
		formData.value.weight = data.weight || "";
		formData.value.phm = data.phm || "";
		formData.value.allergyHistory = data.allergyHistory || "";
		formData.value.medHistory = data.medHistory || "";

		// 判断orgName是否有值
		if (data.orgName && data.orgName !== "") {
			hasOrgName.value = true;
			formData.value.orgName = data.orgName;
			orgId.value = data.orgId; // 保存orgId用于提交
		} else {
			hasOrgName.value = false;
			formData.value.jgbm = "";
		}
	}
	const localPhone = uni.getStorageSync("bindPhone");
	if (localPhone) {
		formData.value.phone = localPhone;
	}
};
onShow(() => {
	const regionData = uni.getStorageSync("selectedRegionData");
	if (regionData) {
		selectedCountryRegion.value = regionData.country;
		selectedProvince.value = regionData.province;
		selectedCity.value = regionData.city;
		selectedDistrict.value = regionData.district;

		const parts = [];
		if (regionData.country) parts.push(regionData.country.region.regionName);
		if (regionData.province) parts.push(regionData.province.region.regionName);
		if (regionData.city) parts.push(regionData.city.region.regionName);
		if (regionData.district) parts.push(regionData.district.region.regionName);
		formData.value.region = parts.join("");

		uni.removeStorageSync("selectedRegionData");
	}
});

// ========== 頭像選擇 ==========
const onChooseAvatar = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ["compressed"],
		sourceType: ["album", "camera"],
		success: (res) => {
			const tempFilePath = res.tempFilePaths[0];
			plus.io.resolveLocalFileSystemURL(tempFilePath, (entry) => {
				entry.file((file) => {
					const reader = new plus.io.FileReader();
					reader.onloadend = (e) => {
						formData.value.profilePicture = e.target.result;
					};
					reader.readAsDataURL(file);
				});
			});
		},
	});
};

// ========== 身份證選擇 ==========
const chooseIdCard = (type) => {
	uni.chooseImage({
		count: 1,
		sizeType: ["compressed"],
		sourceType: ["album", "camera"],
		success: (res) => {
			const tempFilePath = res.tempFilePaths[0];
			if (type === "front") {
				formData.value.frontImg = tempFilePath;
			} else {
				formData.value.backImg = tempFilePath;
			}
		},
	});
};

const radioChange = (name) => {
	console.log("選擇性別", name);
};

// ========== 地址選擇器 ==========
const show = ref(false);
const initAreaColumns = () => {
	const provinces = areaData.map((p) => p.name);
	const cities = areaData[0].children.map((c) => c.name);
	const districts = areaData[0].children[0].children.map((d) => d.name);
	return [provinces, cities, districts];
};
const columns = ref(initAreaColumns());

const openAddPicker = () => {
	uni.navigateTo({
		url: "/pages/mine/minelist/Selectregion",
	});
};
const closePicker = () => (show.value = false);

const confirmPicker = ({ value }) => {
	const newValue = value.map((v, i) => (i === 1 && v === "市辖区" ? "" : v));
	formData.value.region = newValue.filter(Boolean).join("");
	closePicker();
};

const cancelPicker = () => closePicker();
const changePicker = ({ columnIndex, index }) => {
	const provinces = areaData.map((p) => p.name);
	if (columnIndex === 0) {
		const cityList = areaData[index].children.map((c) => c.name);
		const districtList = areaData[index].children[0].children.map((d) => d.name);
		columns.value[1] = cityList;
		columns.value[2] = districtList;
	} else if (columnIndex === 1) {
		const provinceIndex = provinces.indexOf(columns.value[0][0]);
		const districtList = areaData[provinceIndex].children[index].children.map((d) => d.name);
		columns.value[2] = districtList;
	}
};

// ========== 提交 ==========
const showTip = ref(false);
const openShowTip = () => {
	showTip.value = true;
};
const closeShowTip = () => {
	showTip.value = false;
};
const submitShowTip = () => {
	handleConfirm();
};

const submitting = ref(false);
const handleConfirm = async () => {
	// 必填字段校验：userName, sex, birthyDay, height, weight, serialNumber, orgName
	if (!formData.value.userName) return showToast("請輸入姓名", 1000, "none");
	if (!formData.value.sex) return showToast("請選擇性別", 1000, "none");
	if (!formData.value.birthyDay) return showToast("請選擇出生日期", 1000, "none");
	if (!formData.value.height) return showToast("請選擇身高", 1000, "none");
	if (!formData.value.weight) return showToast("請選擇體重", 1000, "none");
	if (!formData.value.phone) return showToast("請輸入手機號", 1000, "none");

	// 机构校验：如果没有orgName，则必须填写机构编码
	if (!hasOrgName.value && !formData.value.jgbm) {
		return showToast("請輸入機構編碼", 1000, "none");
	}

	if (!formData.value.region) return showToast("請選擇省市區", 1000, "none");
	if (!formData.value.detailAddress) return showToast("請輸入詳細地址", 1000, "none");
	if (!formData.value.idCard) return showToast("請輸入身份證號碼", 1000, "none");
	if (!formData.value.frontImg) return showToast("請上傳身份證人像面", 1000, "none");
	if (!formData.value.backImg) return showToast("請上傳身份證國徽面", 1000, "none");
	if (!formData.value.phm) return showToast("請輸入既往病史", 1000, "none");
	if (!formData.value.allergyHistory) return showToast("請輸入過敏史", 1000, "none");
	if (!formData.value.medHistory) return showToast("請輸入用藥史", 1000, "none");

	// 如果没有orgName，需要校验机构编码
	if (!hasOrgName.value) {
		const isValid = await handleDeptCodeBlur();
		if (!isValid) {
			return; // 校验失败不提交
		}
	}

	submitting.value = true;
	uni.showLoading({
		title: "提交中...",
	});

	try {
		const token = uni.getStorageSync("token");

		uni.setStorageSync("bindPhone", formData.value.phone);

		const userInfos = {
			userName: formData.value.userName,
			sex: formData.value.sex,
			serialNumber: formData.value.phone,
			houseAddress: formData.value.detailAddress,
			regions: formData.value.region,
			profilePicture: formData.value.profilePicture,
			idCardNo: formData.value.idCard,
			birthyDay: formData.value.birthyDay,
			height: formData.value.height,
			weight: formData.value.weight,
			phm: formData.value.phm,
			allergyHistory: formData.value.allergyHistory,
			medHistory: formData.value.medHistory,
			orgId: orgId.value,
			deptCode: hasOrgName.value ? "" : formData.value.jgbm,
			userId: uni.getStorageSync("userId"),
		};

		const userInfo = JSON.stringify(userInfos);
		console.log(userInfo);
		const res = await new Promise((resolve, reject) => {
			uni.uploadFile({
				url: BASE_URL + "/miduser/updateUserInfo",
				files: [
					{
						name: "front",
						uri: formData.value.frontImg,
					},
					{
						name: "back",
						uri: formData.value.backImg,
					},
				],
				header: {
					Authorization: `Bearer ${token}`,
				},
				formData: {
					userInfo,
				},
				success: (res) => resolve(JSON.parse(res.data)),
				fail: reject,
			});
		});
		console.log("上傳結果:", res);
		console.log("上傳結果:", res.code);

		if (res.code === "200" && res.data.message === "更新用户信息成功") {
			showToast("修改成功！", 1500, "success");
			setTimeout(() => {
				uni.reLaunch({
					url: "/pages/mine/mine",
				});
			}, 1500);
		} else {
			showToast(res.message || "提交失敗", 1500, "none");
		}
	} catch (err) {
		console.error("提交出錯:", err);
		showToast("提交失敗，請重試", 1500, "none");
	} finally {
		submitting.value = false;
		uni.hideLoading();
		closeShowTip();
	}
};

onMounted(() => {
	getlist();
});
</script>

<style scoped lang="scss">
::v-deep .u-cell__body {
	padding: 3px 0 !important;
}

::v-deep .u-form-item__body__right {
	flex: none !important;
}

::v-deep .u-form-item__body {
	justify-content: space-between !important;
}

::v-deep .u-form-item__body__left__content__label {
	color: #373738 !important;
	font-size: 28rpx !important;
}

.avatar-btn {
	padding: 0;
	margin: 0;
	background: transparent;
	border: none;
	line-height: 1;
}

.person-info {
	overflow: auto;

	.content {
		padding: 32rpx 48rpx 24rpx 48rpx;
		box-sizing: border-box;
		width: 100%;
		min-height: calc(100% - 176rpx);
		background-color: #fafbff;
		overflow: auto;
		padding-bottom: 220rpx;

		.avatar-box {
			box-sizing: border-box;
			padding: 32rpx 32rpx;
			height: 172rpx;
			background: #fff;
			box-shadow: 0rpx 6rpx 12rpx rgba(0, 0, 0, 0.02);
			border-radius: 20rpx;
		}

		.form-box {
			box-sizing: border-box;
			padding: 38rpx 32rpx 32rpx 32rpx;
			height: auto;
			background: #fff;
			box-shadow: 0rpx 6rpx 12rpx rgba(0, 0, 0, 0.02);
			border-radius: 20rpx;
		}

		.box-mt-24 {
			margin-top: 24rpx;
		}

		.id-card-upload {
			display: flex;
			justify-content: space-between;
			margin-top: 32rpx;
			padding: 0 16rpx;

			.upload-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 280rpx;

				.upload-img-wrapper {
					width: 280rpx;
					height: 160rpx;
					border-radius: 16rpx;
					overflow: hidden;

					.id-card-img {
						width: 100%;
						height: 100%;
						border-radius: 16rpx;
					}

					.upload-placeholder {
						width: 100%;
						height: 100%;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						border-radius: 16rpx;

						.placeholder-icon {
							width: 100%;
							height: 100%;
						}
					}
				}

				.upload-text {
					font-size: 24rpx;
					color: #999;
					margin-top: 16rpx;
				}
			}
		}

		.upload-tips {
			margin-top: 24rpx;
			font-size: 24rpx;
			color: #999;
			text-align: center;

			.tips-highlight {
				color: #ffa688;
			}
		}
	}

	.bottom-btn {
		width: 100%;
		box-sizing: border-box;
		padding: 0 48rpx;
		padding-bottom: 72rpx;
		height: 200rpx;
		background: #fff;
		position: fixed;
		bottom: 0;
		left: 0;

		.btn {
			box-sizing: border-box;
			height: 128rpx;
			flex: 1;
			padding: 18rpx 0;
			background: transparent;
			border-radius: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;

			.saveBtn {
				width: 100%;
				height: 92rpx;
				text-align: center;
				line-height: 92rpx;
				background: rgba(69, 151, 103, 1);
				border-radius: 20rpx;
			}
		}
	}
}

.fs-28 {
	font-size: 28rpx;
}

.color-373738 {
	color: #373738;
}

.color-979698 {
	color: #979698;
}

.color-459767 {
	color: #459767;
}

.color-fff {
	color: #fff;
}

.medical-title {
	font-size: 28rpx;
	color: #373738;
	margin-bottom: 16rpx;
	padding-bottom: 16rpx;
	border-bottom: 1px solid #f5f5f5;
}

.popup-box {
	box-sizing: border-box;
	height: fit-content;
	padding: 32rpx 48rpx;
}

.popup-title {
	font-weight: 600;
	font-size: 32rpx;
	color: $text-primary;
	@include flex-center;
}

.popup-text {
	margin-top: 32rpx;
	font-weight: 400;
	font-size: 28rpx;
	color: $text-secondary;
}

.popup-bottom {
	margin-top: 0rpx;
	width: 100%;
	height: 200rpx;
	background-color: rgba($bg-card, 1);
	padding: 20rpx 48rpx;
	@include flex-between;
	gap: 24rpx;
}

.popup-btn {
	width: 50%;
	height: 92rpx;
	background-color: rgba($primary-light, 1);
	border-radius: 20rpx;
	@include flex-center;
	color: rgba($bg-card, 1);
	font-weight: 600;
	font-size: 28rpx;
}

.popup-btn-cancel {
	width: 50%;
	height: 92rpx;
	background-color: rgba($bg-card, 1);
	border-radius: 20rpx;
	@include flex-center;
	color: rgba($text-primary, 1);
	font-weight: 600;
	font-size: 28rpx;
	border: 1px solid $border-color;
}
</style>
