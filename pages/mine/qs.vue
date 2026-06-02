<template>
	<view class="page">
		<view class="pic">
			<image style="width: 750rpx; height: 3042rpx" src="/static/img/32.png" />

			<view style="position:absolute; bottom:150rpx; right:90rpx;">
				<image :src="sign" style="width:150rpx; height:150rpx;" />
			</view>

			<button style="width:200rpx;height:80rpx;position:absolute;bottom:70rpx;right:80rpx;font-size: 26rpx;" @click="tyqs">
			同意签字
			</button>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { contract ,templete} from '@/api/yyf.js'
import { getuser } from '@/api/login.js';
const sign = ref('')
const aa = ref('')
// ================= 签署 =================
const tyqs = async () => {
	try {

		// 1. 读取本地 PDF
		const fileData = await new Promise((resolve, reject) => {
			plus.io.resolveLocalFileSystemURL('/static/img/33.pdf', (entry) => {
				entry.file((file) => {
					const reader = new plus.io.FileReader()

					reader.onloadend = (e) => {
						const base64 = e.target.result.split(',')[1]
						resolve(base64)
					}

					reader.onerror = reject
					reader.readAsDataURL(file)
				})
			}, reject)
		})
		const ddd = await getuser({
			serialNumber: uni.getStorageSync('phone')
		});
		
		
		// 2. 调签署接口
		const params = {
			contract: fileData,
			realName: ddd.data.data.userName,
			idCardNo: ddd.data.data.idCardNo,
			userId: ddd.data.data.userId,
			mobile: ddd.data.data.serialNumber,
			seal: aa.value,
			x: 457.1,
			y: 50.101,
			page: 3
		}
		console.log(params);
		// return
		const res = await contract(params)
		
		console.log(res);
		if(res.code === '200' && res.data.code ==='10000'){
			console.log(res);
			uni.showToast({
				title: '签署成功',
				icon: 'success'
			})
			uni.setStorageSync('consent',res.data.sign)
			setTimeout(() => {
				uni.reLaunch({
					url: "/pages/mine/mine",
				});
			}, 1500);
		}else{
			uni.showToast({
				title: '签署失败',
				icon: 'error'
			})
		}
	} catch (err) {
		console.error(err)

		uni.showToast({
			title: '保存失败',
			icon: 'error'
		})
	}
}
// ================= 初始化签名 =================
onLoad(() => {
	const base64 = uni.getStorageSync('sign')
	sign.value = 'data:image/png;base64,' + base64
	aa.value = base64
})
</script>

<style scoped>
.pic {
	position: relative;
}
</style>