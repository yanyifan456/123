<template>
	<view class="box">
		<!-- 顶部 Tabs -->
		<view class="sticky-box">
			<up-tabs
				:activeStyle="{ color: '#459767' }"
				lineColor="#459767"
				:current="tabsCurrent"
				:list="tabList"
				@change="changeTabs"
			></up-tabs>
		</view>
		<!-- tab1 全部 -->
		<!-- <view class="" v-if="tabsCurrent == 0"> -->
		<!-- 图片区域 -->
		<!-- <view class="pic-box box-mt-24">
				<view
					class="pic-item"
					v-for="(item, index) in tabsData[tabsCurrent].picList"
					:key="index"
					@click="
						jumpToNextPage(`/pages/information/infoDetail?data=${JSON.stringify(item)}`)
					"
				>
					<image :src="item.img" class="img-box" mode="aspectFill"></image>
					<view class="color-fff fs-26 pic-text">
						{{ item.title }}
					</view>
					<view class="color-fff fs-16 pic-time">
						{{ item.time }}
					</view>
				</view>
			</view> -->

		<!-- 卡片列表 -->
		<!-- <view class="card-box box-mt-32">
				<view
					class="card-item box-mb-24"
					v-for="(item, index) in tabsData[tabsCurrent].cardList"
					:key="index"
					@click="
						jumpToNextPage(`/pages/information/infoDetail?data=${JSON.stringify(item)}`)
					"
				>
					<view class="card-pic box-mr-24">
						<image
							src="https://doctor.gzxinxingyiyuan.com/images/image/information/cardPic.png"
							class="img-box"
							mode="aspectFill"
						></image>
					</view>
					<view class="card-content">
						<view class="fs-26 color-373738">醫療團隊管理創新策略</view>
						<view class="fs-20 color-979698 box-mt-16 card-desc">
							歡迎大家參加醫療文件整理專業培訓課程。本課程將專注於教授如何有效管理和歸檔醫療文件，涵蓋各種實用工具、方法論以及實際案例分析
						</view>
						<view class="fs-16 color-979698 box-mt-24">2025年8月19日</view>
					</view>
				</view>
			</view>
		</view> -->
		<!--  醫學常識  -->
		<view class="" v-if="tabsCurrent == 0">
			<!-- 图片区域 -->
			<!-- <view class="pic-box box-mt-24">
				<view class="pic-item1">
					<image
						src="https://doctor.gzxinxingyiyuan.com/images/image/information/cardPic1.png"
						class="img-box"
						mode="aspectFill"
					></image>
					<view class="color-fff fs-26 pic-text1">醫療團隊管理創新策略</view>
					<view class="color-fff fs-16 pic-time1">2025年8月19日</view>
				</view>
			</view> -->

			<!-- 卡片列表 -->
			<view class="card-box box-mt-32">
				<view
					class="card-item box-mb-24"
					v-for="(item, index) in tabsData[tabsCurrent].cardList"
					:key="index"
					@click="jumpToNextPage(`/pages/home/infomation/infoDetail?data=${JSON.stringify(item)}`)"
				>
					<view class="card-pic box-mr-24">
						<image lazy-load="true" :src="item.titlePic" class="img-box" mode="aspectFill"></image>
					</view>
					<view class="card-content">
						<view class="fs-26 color-373738 card-title">{{ item.title }}</view>
						<view class="fs-20 color-979698 box-mt-16 card-desc">
							{{ item.desc }}
						</view>
						<view class="fs-16 color-979698 box-mt-24">{{ item.time }}</view>
					</view>
				</view>
			</view>
		</view>
		<!--  传媒报道  -->
		<view class="" v-if="tabsCurrent == 1">
			<!-- 图片区域 -->
			<view class="pic-box box-mt-24">
				<view
					class="pic-item1"
					v-for="(item, index) in tabsData[tabsCurrent].picList"
					:key="item.id"
					@click="jumpToNextPage(`/pages/home/infomation/infoDetail?data=${JSON.stringify(item)}`)"
				>
					<image :src="item.titlePic" class="img-box" mode="aspectFill"></image>
					<view class="color-fff fs-26 pic-text1">{{ item.title }}</view>
					<view class="color-fff fs-16 pic-time1">{{ item.time }}</view>
				</view>
			</view>

			<!-- 卡片列表 -->
			<view class="card-box box-mt-32">
				<view
					class="card-item box-mb-24"
					v-for="(item, index) in tabsData[tabsCurrent].cardList"
					:key="index"
					@click="jumpToNextPage(`/pages/home/infomation/infoDetail?data=${JSON.stringify(item)}`)"
				>
					<view class="card-pic box-mr-24">
						<image :src="item.titlePic" class="img-box" mode="aspectFill"></image>
					</view>
					<view class="card-content">
						<view class="fs-26 color-373738 card-title">{{ item.title }}</view>
						<view class="fs-20 color-979698 box-mt-16 card-desc">
							{{ item.desc }}
						</view>
						<view class="fs-16 color-979698 box-mt-24">{{ item.time }}</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 企业视频 -->
		<view class="" v-if="tabsCurrent == 2">
			<!-- 图片区域 -->
			<view class="pic-box box-mt-24" v-if="tabsData[tabsCurrent].picList.length != 0">
				<view
					class="pic-item1"
					@click="jumpToNextPage(`/pages/home/infomation/infoDetail?data=${JSON.stringify(item)}`)"
				>
					<image
						src="https://doctor.gzxinxingyiyuan.com/images/image/infomation/cardPic1.png"
						class="img-box"
						mode="aspectFill"
					></image>
					<view class="color-fff fs-26 pic-text1">醫療團隊管理創新策略</view>
					<view class="color-fff fs-16 pic-time1">2025年8月19日</view>
					<view class="video-icon">
						<!-- <image
							src="https://doctor.gzxinxingyiyuan.com/images/image/infomation/videoIcon.png"
							class="img-box"
							mode="aspectFill"
						></image> -->
					</view>
				</view>
			</view>

			<!-- 卡片列表 -->
			<view class="card-video box-mt-32">
				<view
					class="video-item box-mb-24"
					v-for="(item, index) in tabsData[tabsCurrent].cardList"
					:key="item.id"
					@click="jumpToNextPage(`/pages/home/infomation/infoDetail?data=${JSON.stringify(item)}`)"
				>
					<view class="video-pic">
						<image :src="item.titlePic" class="img-box" mode="aspectFill"></image>
						<view class="video-icon">
							<!-- <image
								src="https://doctor.gzxinxingyiyuan.com/images/image/infomation/videoIcon.png"
								class="img-box"
								mode="aspectFill"
							></image> -->
						</view>
					</view>
					<view class="video-title fs-26 color-373738 box-mt-16">
						{{ item.title }}
					</view>
					<view class="video-desc fs-20 color-979698 box-mt-16">
						{{ item.desc }}
					</view>
					<view class="video-time fs-16 color-979698 box-mt-24">{{ item.time }}</view>
				</view>
			</view>
		</view>

		<!-- 底部加载状态 -->
		<view class="status-box" v-if="tabsData[tabsCurrent].cardList.length > 0 || loading">
			<view v-if="loading" class="loading">
				<up-loading-icon size="20" mode="circle"></up-loading-icon>
				<text class="ml-12">正在加載...</text>
			</view>
			<view v-else-if="!hasMore" class="no-more">沒有更多了</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onShow, onReachBottom } from "@dcloudio/uni-app";
import { setNavigationBar } from "@/utils/navigation.js";
import { jumpToNextPage } from "@/utils/jumpTo.js";

onShow(() => {
	setNavigationBar("港醫講醫", "#ffffff");
});
const hasMore = ref(false);
const loading = ref(false);
const tabsCurrent = ref(0);
const tabList = reactive([
	// { name: "全部" },
	{ name: "醫學常識" },
	{ name: "傳媒報導" },
	{ name: "企業視頻" },
]);

// 每个 tab 的数据
const tabsData = reactive({
	// 0: {
	// 	// 全部
	// 	picList: [
	// 		{
	// 			img: "https://doctor.gzxinxingyiyuan.com/images/image/information/pic1.png",
	// 			title: "這是第一個圖片的標題，很長會換行...",
	// 			time: "2025年8月19日",
	// 		},
	// 		{
	// 			img: "https://doctor.gzxinxingyiyuan.com/images/image/information/pic1.png",
	// 			title: "這是第二個圖片的標題，很長會換行...",
	// 			time: "2025年8月19日",
	// 		},
	// 	],
	// 	cardList: [
	// 		{ id: 1, title: "全部-卡片1", desc: "這裡是卡片描述 1" },
	// 		{ id: 2, title: "全部-卡片2", desc: "這裡是卡片描述 2" },
	// 	],
	// },
	0: {
		// 医学常识
		picList: [], // 沒有圖片區域
		cardList: [
			{
				id: 1,
				title: "科學館舉辦普及講座　增進市民的醫學常識",
				desc: `現代人的飲食態度彷彿是兩個極端，有人奉行「民以食為天」，餐餐大魚大肉、大吃大喝；有人則不斷節食，甚致厭食。其實不懂控制食量，過多或者過少都會導致飲食失調，對身體帶來嚴重不良後果。
				香港科學館現與香港中文大學醫學院合作，在七、八月期間於科學館演講廳舉行一連串普及醫學講座，其中兩項將探討控制體重與飲食健康的問題。首個講座「跟肥胖說再見」將於本星期六（七月十四日）下午二時三十分至四時正舉行，講者會概述肥胖的醫學定義、成因及預防方法，並講解各種減肥方法的謬誤，以免消費者墮入陷阱；參加者還有機會進行脂肪評估，了解自己的身體狀況。該項講座將輔以小型展覽，讓參加者對肥胖問題有更多瞭解。另一名為「厭食與暴食之謎」的講座則於八月十八日舉行，內容主要闡述厭食症及暴食症的臨床病癥、病發原因及治療患者的技巧。
				此外，還有多個講座就多種常見病症包括骨質疏鬆、近視、癡呆症及哮喘作詳盡的探討。部分講座會安排相關的免費健康檢查，包括骨質密度檢查、色覺測試、立體感測試、其他視力檢查、心理測驗、最高流速及肺功能測試等，檢查名額將以即場抽籤方式決定。`,
				time: "2025年9月3日",
				titlePic: "https://doctor.gzxinxingyiyuan.com/images/image/information/titlePic1.png",
				detailPic:
					"https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEBpdlowS7YZmRg7cuOX1R0NM2yPN7FIwACPBkAAj4FCFYBJKuxufQaVTYE.png",
			},
			{
				id: 2,
				title: "使用藥物常識",
				desc: `藥物可以治療疾病和減輕症狀，但亦可能引起不良的副作用；不適當的使用藥物可引致健康受損。所以市民必須認識藥物的用途，及依從醫生或藥劑師的指示服藥。
				病人應該按時服用醫生處方的藥物，不可隨便加減服藥的次數或藥物的份量。因過量可能會引致中毒，甚至死亡；而藥量不夠則不能治療病情。市民應按時覆診，清楚地告訴生你對藥物的反應，由醫生按病情需要，去加減藥量，或更換一種更適合的藥物。
				切勿將醫生處方給自己的藥物推薦予他人使用，因為病徵相似並不代表是同一種病，每一個人的體質亦不一樣，胡亂使用，不僅會延誤病情，更可能因不良副作用而造成危險。`,
				time: "2025年9月2日",
				titlePic: "https://doctor.gzxinxingyiyuan.com/images/image/information/titlePic3.png",
				detailPic:
					"https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEBpe5owTEk1CySSTZ2qwUkfLjQA0Ag2QACVxkAAj4FCFZxnid1ElepdjYE.png",
			},
			{
				id: 3,
				title: "醫理－善用抗生素",
				desc: `抗生素是一類需經醫生處方的藥物，主要用作預防或治療因細菌感染而引致的疾病，如肺炎、尿道炎及腦膜炎等。
一種最常見的誤解是以為抗生素能醫治一切炎症。抗生素的作用是透過殺滅細菌從而紓緩因細菌感染而造成的發炎徵狀，這類發炎跟其他炎症(如關節炎)是完全不同的。此外，對於由病毒引起的疾病如傷風、感冒和腸胃炎等，使用抗生素不但不能治療或減輕症狀，反而會增加引起副作用及細菌產生抗藥性的風險，失去抗生素應有的療效。`,
				time: "2025年9月1日",
				titlePic: "https://doctor.gzxinxingyiyuan.com/images/image/information/titlePic2.png",
				detailPic:
					"https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEBpe9owTEmVrN1SUOrb2-4AqeuaztdbgACWBkAAj4FCFaUShaojvcDYzYE.png",
			},
		],
	},
	1: {
		// 传媒报道
		picList: [
			{
				id: 1,
				titlePic: "https://doctor.gzxinxingyiyuan.com/images/image/information/bigPic1.png",
				detailPic: "https://doctor.gzxinxingyiyuan.com/images/image/information/bigPic1.png",
				title: "在威院孕育生命的故事",
				time: "2025年9月5日",
				desc: `威爾斯親王醫院婦產科一直以頂尖的醫療服務和人性化照護著稱，致力為準父母提供全面的產科、婦科及生殖醫學支援。從產前檢查、分娩到產後護理，團隊憑藉先進技術和豐富經驗，陪伴每個家庭度過人生重要時刻。
				醫院製作了一段約四分鐘的短片，記錄了一位接受人工受孕的媽媽在醫院的真實經歷。透過她的分享，你將看到醫護人員如何以專業與溫暖，協助她克服挑戰，最終迎來期盼已久的新生命。她的故事，正是威爾斯親王醫院婦產科「以人為本」服務精神的縮影。
				短片亦訪問了婦產科榮譽顧問醫生鍾佩樺醫生和副顧問醫生吳嘉詠醫生，介紹醫院輔助生育技術中心的最先進的服務，包括胚胎植入前篩查及保存生殖能力技術，為這些病人的家庭帶來希望。
				讓我們一同走進這段充滿希望的旅程，見證頂尖醫療技術與真摯人性化照護的完美結合。`,
			},
		],
		cardList: [
			{
				id: 1,
				titlePic: "https://doctor.gzxinxingyiyuan.com/images/image/information/titlePic4.png",
				detailPic: "https://doctor.gzxinxingyiyuan.com/images/image/information/detailPic4.png",
				title: "心繫童夢，牽手同行",
				time: "2025年9月5日",
				desc: `七月的陽光熾熱耀眼，空氣中瀰漫著暑假特有的歡騰氣息，一些孩子們可能興奮地談論著旅行計劃，主題樂園的歡笑聲彷彿隨風飄來。然而，一些患有複雜嚴重疾病的兒童，身體的限制讓他們難以得到這些選擇。在威爾斯親王醫院兒科部，有一支紓緩治療小組「童夢牽」，一直秉持「心繫童夢，牽手同行」的理念，專注為患有生命受限或複雜嚴重疾病的兒童，提供全人關懷，致力提升孩子的生活質素，並減輕家屬在照顧過程中的壓力與不安。這次，我們的目標很簡單——讓四名需乘輪椅的長期病童，能和他們的至親一起暢遊主題樂園，體驗「和其他孩子一樣的歡笑」。
				這不僅是一趟旅程，更是一場愛的精密策劃。出發前紓緩治療小組護士們反覆確認孩子的用藥時間與身體耐受度；仔細測量輪椅大小，為他們量身設計合適的行程；出發時高度戒備確保孩子在復康巴上的安全；小組醫護沿途守護，寸步不離，照顧每位病童的安全；迪士尼樂園的義工團隊主動帶領隊伍，確保隊伍安全到達景點，讓孩子們可暢通無阻地遊玩不同設施。當孩子們的輪椅終於越過樂園大門的剎那，我看見了他們天真爛漫的笑容，無論是3D影視體驗，還是森林河流之旅，孩子們經歷了少有的視覺、官能剌激。家長們在醫護支持下亦能放下平日的擔憂，與孩子一同享受當下的溫馨時光。在家長們的手機裡，從此多了一批和孩子一起暢遊樂園的珍貴回憶。
				其實，這次主題樂園之旅只是紓緩治療小組工作的縮影。小組採用「以家庭為中心的照護模式（family-centered care）」，強調與家長及家庭成員的緊密合作，尊重每個家庭的價值觀與照護選擇，共同陪伴病童走過人生的每一個階段。這種模式有助於建立互信關係，使照護更具人性化。
				小組照顧的每一位孩子，他們都患有生命受限的疾病，如先天性疾病和神經肌肉疾病，他們需要長期的醫療照護，在家也需要使用呼吸機、氧氣、喉管餵飼等比較複雜的醫療儀器和程序。但我們深信，即使有這些限制，每一位病童仍是獨一無二的，他們的需求不僅限於身體層面，更涵蓋心理、情感及靈性層面。病童在兒科病房及門診接受各項專業評估，包括醫生、護士、營養師，物理冶療師等專業人員會診，為病童提供全面評估與個別化照護計劃，確保病童在各方面的需要都能獲得關注。
				「童夢牽」服務不限於孩子，也照顧他們的家人，不限於醫院，也延伸到家庭。小組提供電話諮詢服務，讓家長能即時獲取專業資訊，減少因不確定而產生的焦慮與憂慮。我們同時積極聯繫社區非牟利組織，為這些家庭提供情緒和經濟支援，強化家庭支援網絡。我們深信：「重症孩子的康復或生命或許有限，但生活質素可以無限延伸。」我們希望，無論在病房內外，都能用專業、愛心和創意，為孩子與家庭種下希望的種子。
				成立於2020年的威爾斯親王醫院兒科紓緩治療小組，不僅是醫療服務的延伸，更是一份對生命的尊重與守護。即使孩子在最艱難的時刻，愛與陪伴依然能為病童與家庭帶來力量與希望。未來，我們將持續優化服務，深化跨專業合作，並加強與社區資源的連結，致力於成為病童與家庭在最困難時刻的同行者。`,
			},
			{
				id: 2,
				titlePic: "https://doctor.gzxinxingyiyuan.com/images/image/information/titlePic5.png",
				detailPic: "https://doctor.gzxinxingyiyuan.com/images/image/information/detailPic5.png",
				title: "醫管局優化白內障手術服務　增6成手術量助患者重見光明",
				time: "2025年9月5日",
				desc: `面對人口老化及白內障手術需求持續攀升，醫院管理局（醫管局）大力推行「高流量白內障手術服務模式」，通過優化流程、擴充專屬手術時段及精準篩選病人，手術室每節可進行的手術量提升60%，旨在縮短患者輪候時間，助長者早日重拾清晰視力。
				醫管局質素及安全總監黃立己指出，白內障是常見眼疾，患病機會隨年齡增長而上升。隨着人口老化，白內障手術需求預期持續增加。目前，醫管局每年約有2.5萬至3萬宗白內障新症，且部分以日間個案形式進行。截至今年6月30日，眼科輪候白內障手術的個案達65,944宗，整體輪候時間的第90個百分位數為37個月，即超過3年。
				黃立己強調，當前面臨多重挑戰，包括人口老化、2019冠狀病毒病疫情導致手術積壓及醫護人手流失，使得服務需求持續增長；而延遲手術會影響患者視力及生活質量。為此，醫管局計劃通過優化手術流程和手術室使用率、整合排程設立專屬手術時段、推展高流量手術模式至更多醫院等措施應對。`,
			},
		],
	},
	2: {
		// 企业视频
		picList: [],
		cardList: [
			{
				id: 1,
				titlePic: "https://doctor.gzxinxingyiyuan.com/images/image/video/hangkangCover1.png",
				detailVideo: "https://doctor.gzxinxingyiyuan.com/images/image/video/hangkang1.mp4",
				title: "公院醫生半日看逾40病人",
				time: "2025年9月5日",
				desc: `公立醫院醫生人手短缺越來越嚴重，曾在公立醫院工作的醫生說，半日就要應付40個病人，是迫不得已才離開。有現職公立醫生說，留在公營體系可幫助更多病人，但希望醫管局可增撥資源，紓緩工作壓力。眼科醫生羅智峯：「我轉到私人市場沒有人認識我，有什麼人會來看病呢？我租用的舖位需要交租，又要支薪予護士、燈油火蠟，你會思考很多這些事。
				羅智峯6年前離開公立醫院轉為私人執業，「我當時一個早上要看40多名病人，及至我離開後，有些留在醫管局的同事說要看60名病人。不是逼得太厲害，大部分醫生也不想離開。」腫瘤科醫生黃錦洪：「大家都是盡量希望幫助病人，當然我在公立醫院幫助病人的數字會較多。不單止是單打獨鬥，其實自己本身也有一組人、一隊人，大家互相互動、互相扶持，這樣的工作環境我會覺得較開心。」黃錦洪在公立醫院一做便34年，認同診症時間趕急：「需要20至30分鐘處理一個病症，但可能病人見醫生，最多都是10至15分鐘已算多。很多時候未前往門診前，需要事先查閱他們的病歷，當然這是用了自己時間或用額外的門診時間做。」不單時間會花多了，帶來的壓力亦很大。
				羅智峯：「你看完這個看那個，當你診症完畢後，你有半小時吃飯，甚至沒有時間吃飯，接著便要去手術室了。好像一直跟時間競賽那種壓力。（醫管局近年有措施改善工作環境，會否考慮間中返回公立醫院任兼職醫生幫忙一下？）我真的十分討厭醫管局整套的制度，不喜歡只得數分鐘看一個症。」即使沒有離開，黃錦洪也希望醫管局可增撥資源：「如果剝削我們太多進修時間，令我們這條橡筋長期都繃得太緊時，便可能不太理想了。」翻查過去三年的數字，公立醫院每年平均都有超過300名全職醫生離職，醫管局說有推出措施增聘及挽留人手，包括增加駐院醫生的培訓名額，以及提供晉升機會。`,
			},
			{
				id: 2,
				titlePic: "https://doctor.gzxinxingyiyuan.com/images/image/video/hangkangCover2.png",
				detailVideo: "https://doctor.gzxinxingyiyuan.com/images/image/video/hongkang2.mp4",
				title: "公立醫院收費改革｜政府指急症室收費不應與私家診所比較",
				time: "2025年9月5日",
				desc: `當局公布公營醫療收費改革方案，被問收費改革會否帶動私營醫療都加價，政府指，急症室不應與私家診所比較。
				醫管局行政總裁高拔陞說：「私家醫生很多時看最簡單的傷風感冒都要數百元，但那些是看最簡單的上呼吸道感染。急症室整個配置是全年24小時、365天都開，照顧最嚴重的病。如果大家真的要比較，私營醫院真正急症，我相信收費遠超我們建議的收費。」
				醫務衞生局局長盧寵茂稱：「今次我們強調不是簡單調整，不應用以往收費計算今次應該達至甚麼標準，因為為何要改革？因為我們知道以往收費制度是不可以持續、有很大問題。」`,
			},
		],
	},
});

// 切换 tab
const changeTabs = ({ index }) => {
	tabsCurrent.value = index;
	uni.pageScrollTo({ scrollTop: 0, duration: 0 });
};

// 禁用懶加載
onReachBottom(() => {
	return;
});
</script>

<style scoped lang="scss">
.box {
	width: 100vw;
	min-height: 100vh;
	background: $bg-page;
	box-sizing: border-box;
	padding: 0 48rpx 68rpx;
}

.sticky-box {
	position: sticky;
	background: $bg-page;
	top: 0;
	z-index: 9;
}

.pic-box {
	width: 100%;
	height: 378rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;

	.pic-item {
		width: 314rpx;
		height: 100%;
		border-radius: 20rpx;
		position: relative;
		overflow: hidden;
		.pic-text {
			width: 100%;
			height: 76rpx;
			position: absolute;
			bottom: 58rpx;
			box-sizing: border-box;
			padding: 0 16rpx;
			line-height: 38rpx;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			text-overflow: ellipsis;
			word-break: break-all;
		}
		.pic-time {
			position: absolute;
			bottom: 16rpx;
			left: 16rpx;
		}
	}
	.pic-item1 {
		width: 100%;
		height: 100%;
		border-radius: 20rpx;
		position: relative;
		overflow: hidden;
		.pic-text1 {
			width: 100%;
			height: 38rpx;
			position: absolute;
			bottom: 58rpx;
			box-sizing: border-box;
			padding: 0 16rpx;
			line-height: 38rpx;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			word-break: break-all;
		}
		.pic-time1 {
			position: absolute;
			bottom: 16rpx;
			left: 16rpx;
		}
		.video-icon {
			width: 64rpx;
			height: 64rpx;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}
}

.card-box {
	.card-item {
		height: 208rpx;
		width: 100%;
		background: #fff;
		box-shadow: 0rpx 6rpx 12rpx 0rpx rgba(0, 0, 0, 0.0196);
		border-radius: 20rpx;
		box-sizing: border-box;
		padding: 16rpx;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		.card-pic {
			width: 176rpx;
			height: 176rpx;
			border-radius: 20rpx;
		}
		.card-content {
			flex: 1;
			box-sizing: border-box;
			height: 176rpx;
			padding: 12rpx 0 8rpx;
		}
		.card-title {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1; /* 限制两行 */
			overflow: hidden;
			text-overflow: ellipsis;
			word-break: break-all;
			line-height: 32rpx; /* 建议加上行高让两行更匀称 */
		}
		.card-desc {
			/* 多行省略号 */
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2; /* 限制两行 */
			overflow: hidden;
			text-overflow: ellipsis;
			word-break: break-all;
			line-height: 32rpx; /* 建议加上行高让两行更匀称 */
		}
	}
}

.card-video {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12rpx;
	.video-item {
		width: 314rpx;
		height: 378rpx;
		background: #fff;
		box-shadow: 0rpx 6rpx 12rpx 0rpx rgba(0, 0, 0, 0.0196);
		border-radius: 20rpx;
		box-sizing: border-box;
		padding: 16rpx;
		.video-pic {
			width: 282rpx;
			height: 176rpx;
			border-radius: 20rpx;
			position: relative;
		}
		.video-icon {
			width: 64rpx;
			height: 64rpx;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
		.video-title {
			/* 最多一行，超出省略 */
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.video-desc {
			/* 最多两行，超出省略 */
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			text-overflow: ellipsis;
			word-break: break-all;
			line-height: 28rpx; /* 建议加上行高 */
		}
	}
}
.status-box {
	width: 100%;
	text-align: center;
	padding: 24rpx 0;
	font-size: 26rpx;
	color: #999;

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.no-more {
		color: #bbb;
	}
}
.ml-12 {
	margin-left: 12rpx;
}
</style>
