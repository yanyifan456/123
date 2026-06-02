<template>
	<!-- ECharts 容器 -->
	<l-echart ref="myChart" style="width: 100%; height: 550rpx"></l-echart>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import { onReady } from "@dcloudio/uni-app";
import * as echarts from "echarts";

const props = defineProps({
	data: {
		type: Object,
		default: () => ({}),
	},
	active: Boolean, // 是否当前页
});

const myChart = ref(null);
let chartInstance = null;
let pointerValue = 0; // ⭐⭐⭐ 关键：提升作用域
let gaugeMin = 0; // 顺便也提升（下面会用到）
// 监听数据变化，数据变化时自动刷新图表
watch(
	() => props.active,
	(val) => {
		if (val && chartInstance && !chartInstance.isDisposed()) {
			chartInstance.setOption({
				series: [
					{
						animation: false,
						data: [{ value: gaugeMin }],
					},
				],
			});

			setTimeout(() => {
				if (!chartInstance || chartInstance.isDisposed()) return;

				chartInstance.setOption({
					series: [
						{
							animation: true,
							animationDurationUpdate: 500,
							animationEasingUpdate: "cubicOut",
							data: [{ value: pointerValue }],
						},
					],
				});
			}, 50);
		}
	},
	{ immediate: true },
);

const initChart = () => {
	if (!props.data.metricName) {
		uni.showToast({
			title: "数据获取失败！请联系开发者！",
			icon: "none",
		});
		return;
	}
	if (chartInstance && !chartInstance.isDisposed()) return;
	myChart.value.init(echarts, null, {}, (chart) => {
		chartInstance = chart;
		const metricVal = Number(props.data.metricVal?.val || 0);
		const rangeItems = props.data.ranges?.items || [];

		if (rangeItems.length === 0) {
			showToast("区间数据为空！");
			return;
		}

		// 1️⃣ 标准化区间：保证每条区间 min <= max
		const normalizedRanges = rangeItems.map((item) => {
			let minVal = Number(item.min);
			let maxVal = Number(item.max);
			if (minVal > maxVal) [minVal, maxVal] = [maxVal, minVal]; // 自动交换异常区间
			return { ...item, min: minVal, max: maxVal };
		});

		// 风险型（4 段）颜色
		const severityColorMap = {
			正常: "#52AE7B",
			轻度: "#F0B246",
			中度: "#EA422A",
			重度: "#BD1800",
		};

		// 状态型（3 段）颜色
		const stateColorMap = {
			偏低: "#6F66EC",
			正常: "#52AE7B",
			偏高: "#BD1800",
		};
		// 判断区间类型（语义驱动，而不是数量驱动）
		const isSeverityType = normalizedRanges.some((r) => /轻度|中度|重度/.test(r.item));

		const isStateType = normalizedRanges.some((r) => /偏低|正常|偏高/.test(r.item));
		// 2️⃣ 计算整个仪表盘的最小值和最大值
		// const gaugeMin = Math.min(...normalizedRanges.map((r) => r.min));
		gaugeMin = Math.min(...normalizedRanges.map((r) => r.min));

		const gaugeMax = Math.max(...normalizedRanges.map((r) => r.max));

		// 3️⃣ 生成颜色区间，stop 是 0~1 的比例
		// 3️⃣ 生成颜色区间（必须按 max 升序排序）
		// const axisColors = normalizedRanges
		// 	.slice()
		// 	.sort((a, b) => a.max - b.max) // ⭐⭐⭐ 关键
		// 	.map((r) => {
		// 		let color = "#52AE7B";
		// 		if (r.item.includes("轻度")) color = "#F0B246";
		// 		if (r.item.includes("中度")) color = "#EA422A";
		// 		if (r.item.includes("重度")) color = "#BD1800";

		// 		const stop = (r.max - gaugeMin) / (gaugeMax - gaugeMin);
		// 		return [stop, color];
		// 	});

		const axisColors = normalizedRanges
			.slice()
			.sort((a, b) => a.max - b.max) // ⚠️ 必须升序
			.map((r) => {
				let color = "#52AE7B"; // 默认绿色

				// 四段风险型
				if (isSeverityType) {
					if (r.item.includes("正常")) color = severityColorMap.正常;
					if (r.item.includes("轻度")) color = severityColorMap.轻度;
					if (r.item.includes("中度")) color = severityColorMap.中度;
					if (r.item.includes("重度")) color = severityColorMap.重度;
				}

				// 三段状态型
				if (isStateType) {
					if (r.item.includes("偏低")) color = stateColorMap.偏低;
					if (r.item.includes("正常")) color = stateColorMap.正常;
					if (r.item.includes("偏高")) color = stateColorMap.偏高;
				}

				const stop = (r.max - gaugeMin) / (gaugeMax - gaugeMin);
				return [stop, color];
			});

		// 4️⃣ 刻度标签格式化函数，显示区间名称
		// const axisLabelFormatter = (val) => {
		// 	for (let r of normalizedRanges) {
		// 		if (val >= r.min && val <= r.max) return r.item;
		// 	}
		// 	return "";
		// };
		const axisLabelFormatter = (val) => {
			for (let r of rangeItems) {
				const minVal = Number(r.min);
				const maxVal = Number(r.max);
				if (val >= Math.min(minVal, maxVal) && val <= Math.max(minVal, maxVal)) {
					// 返回当前区间的 min 或 max 数值
					return `${val.toFixed(3)}`; // 可以保留整数，如果想保留小数改成 toFixed(2)
				}
			}
			return "";
		};

		// 5️⃣ 指针值限制在 gauge 最小值和最大值之间
		// const pointerValue = Math.min(Math.max(metricVal, gaugeMin), gaugeMax);
		pointerValue = Math.min(Math.max(metricVal, gaugeMin), gaugeMax);

		// 原始区间数量
		const rangeCount = normalizedRanges.length;

		// splitNumber = 区间数 + 4，但最多 8
		const splitNumber = Math.min(rangeCount + 4, 8);
		// 6️⃣ 配置图表
		chart.setOption({
			series: [
				{
					type: "gauge", // 仪表盘类型
					startAngle: 180, // 起始角度（左侧）
					endAngle: 0, // 结束角度（右侧）
					center: ["50%", "59%"], // 仪表盘中心位置
					radius: "90%", // 仪表盘半径
					min: gaugeMin, // 仪表盘最小值
					max: gaugeMax, // 仪表盘最大值
					splitNumber: splitNumber, // 刻度分段数
					axisLine: {
						lineStyle: {
							width: 15, // 仪表盘轴线宽度
							color: axisColors, // 颜色区间
						},
					},
					pointer: {
						icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z", // 指针图标
						length: "40%", // 指针长度
						width: 12, // 指针宽度
						offsetCenter: [0, "-40%"], // 指针偏移
						itemStyle: { color: "auto" }, // 自动使用轴线颜色
					},
					axisTick: {
						length: 12, // 刻度线长度
						lineStyle: { color: "auto", width: 2 }, // 自动颜色
					},
					splitLine: {
						length: 20, // 分隔线长度
						lineStyle: { color: "auto", width: 5 }, // 自动颜色
					},
					axisLabel: {
						color: "#181b19", // 刻度文字颜色
						fontSize: 10, // 字体大小
						distance: -40, // 与轴线距离
						rotate: "tangential", // 文字旋转方式
						formatter: axisLabelFormatter, // 格式化函数
					},
					detail: {
						fontSize: 18, // 详情文字大小
						offsetCenter: [0, "-20%"], // 位置偏移
						valueAnimation: true, // 指针变化动画
						rich: {
							val: { fontSize: 20, fontWeight: 900 }, // 指针值样式
							range: { fontSize: 16, padding: [0, 0, 0, 0] }, // 区间文字样式
						},
						formatter() {
							// 显示指针值和区间文本
							return `{val|${pointerValue.toFixed(2)}}\n{range|${props.data.summary?.resultText || ""}}`;
						},
						color: "inherit", // 继承颜色
					},
					data: [{ value: pointerValue }], // 指针数据
				},
			],
		});
	});
};

// 页面挂载时初始化图表
onMounted(() => initChart());
onUnmounted(() => {
	if (chartInstance && !chartInstance.isDisposed()) {
		chartInstance.dispose();
		chartInstance = null;
	}
});
</script>

<style scoped lang="scss">
.box {
	width: 100%;
	height: 100%;
}
</style>
