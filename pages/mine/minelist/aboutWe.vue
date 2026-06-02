<template>
        <view class="container about-box">
                <view class="content">
                        <!-- LOGO 和 應用名 -->
                        <view class="app-info">
                                <image
                                        class="logo"
                                        src="/static/img/21.png"
                                        mode="aspectFit"
                                />
                                <text class="app-name">環球港醫網</text>
                                <text class="app-desc">一個可以線上看病的APP</text>
                        </view>
                        <!-- 菜單列表 -->
                        <view class="menu-card">
                                <view class="menu-item" @click="goPage('/pages/login/yhxy')">
                                        <text class="menu-text">用户協議</text>
                                        <up-icon name="arrow-right" size="14" color="#ccc" />
                                </view>
                                <view class="menu-divider"></view>
                                <view class="menu-item" @click="goPage('/pages/login/yszc')">
                                        <text class="menu-text">隱私政策</text>
                                        <up-icon name="arrow-right" size="14" color="#ccc" />
                                </view>
                        </view>
                </view>
        </view>
</template>
<script setup>
import { onShow } from "@dcloudio/uni-app";
import { setNavigationBar } from "@/utils/navigation";

const goPage = (url) => {
        if (!url) return
        uni.navigateTo({ url })
}
onShow(() => {
        setNavigationBar("關於我們");
});
</script>
<style scoped lang="scss">
.content {
        padding: 32rpx 48rpx;
        width: 100%;
        min-height: 100vh;
        background-color: #f5f5f5;
        box-sizing: border-box;
        overflow: auto;
}
// APP 資訊
.app-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 40rpx;
        margin-bottom: 60rpx;
        .logo {
                width: 120rpx;
                height: 120rpx;
                border-radius: 24rpx;
                margin-bottom: 24rpx;
        }
        .app-name {
                font-size: 30rpx;
                font-weight: 600;
                color: #333;
                margin-bottom: 12rpx;
        }
        .app-desc {
                font-size: 24rpx;
                color: #999;
        }
}
// 菜單卡片
.menu-card {
        background: #fff;
        border-radius: 20rpx;
        overflow: hidden;
}
.menu-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 32rpx;
}
.menu-text {
        font-size: 28rpx;
        color: #333;
}
.menu-divider {
        height: 1rpx;
        background: #f0f0f0;
        margin: 0 32rpx;
}
</style>




