import type { BlogConfig } from "../types/config";

export const initialConfig: BlogConfig = {
	site: {
		title: "Mizuki",
		subtitle: "One demo website",
		siteURL: "http://s0raLin.github.io/",
		siteStartDate: "2026-03-04",
		timeZone: 8,
		lang: "zh_CN",
		themeColor: {
			hue: 60,
			fixed: false,
		},
		showLastModified: true,
		showCoverInContent: true,
		generateOgImages: false,
	},
	featurePages: {
		anime: true,
		diary: true,
		friends: true,
		projects: true,
		skills: true,
		timeline: true,
		albums: true,
		devices: true,
	},
	navbarTitle: {
		mode: "logo",
		text: "MizukiUI",
		icon: "assets/home/home.png",
		logo: "assets/home/default-logo.png",
	},
	banner: {
		desktop: [
			"/assets/desktop-banner/1.webp",
			"/assets/desktop-banner/2.webp",
			"/assets/desktop-banner/3.webp",
			"/assets/desktop-banner/4.webp",
			"/assets/desktop-banner/5.webp",
			"/assets/desktop-banner/6.webp",
		],
		mobile: [
			"/assets/mobile-banner/1.webp",
			"/assets/mobile-banner/2.webp",
			"/assets/mobile-banner/3.webp",
			"/assets/mobile-banner/4.webp",
			"/assets/mobile-banner/5.webp",
			"/assets/mobile-banner/6.webp",
		],
		position: "center",
		carousel: {
			enable: true,
			interval: 1.5,
		},
		waves: {
			enable: true,
			performanceMode: false,
			mobileDisable: false,
		},
		homeText: {
			enable: true,
			title: "わたしの部屋",
			subtitle: [
				"特別なことはないけど、君がいると十分です",
				"今でもあなたは私の光",
				"君ってさ、知らないうちに私の毎日になってたよ",
				"君と話すと、なんか毎日がちょっと楽しくなるんだ",
				"今日はなんでもない日。でも有点像い日",
			],
			typewriter: {
				enable: true,
				speed: 100,
				deleteSpeed: 50,
				pauseTime: 2000,
			},
		},
		credit: {
			enable: false,
			text: "Describe",
			url: "",
		},
	},
	profile: {
		avatar: "assets/images/avatar.webp",
		name: "まつざか ゆき",
		bio: "世界は大きい、君は行かなければならない",
		typewriter: {
			enable: true,
			speed: 80,
		},
		links: [
			{
				name: "Bilibili",
				icon: "fa7-brands:bilibili",
				url: "https://space.bilibili.com/701864046",
			},
			{
				name: "Gitee",
				icon: "mdi:git",
				url: "https://gitee.com/matsuzakayuki",
			},
			{
				name: "GitHub",
				icon: "fa7-brands:github",
				url: "https://github.com/matsuzaka-yuki",
			},
			{
				name: "Codeberg",
				icon: "simple-icons:codeberg",
				url: "https://codeberg.org",
			},
			{
				name: "Discord",
				icon: "fa7-brands:discord",
				url: "https://discord.gg/MqW6TcQtVM",
			},
		],
	},
	announcement: {
		title: "",
		content: "ブログへようこそ！これはサンプルの告知です",
		closable: true,
		link: {
			enable: true,
			text: "Learn More",
			url: "/about/",
			external: false,
		},
	},
	musicPlayer: {
		enable: true,
		mode: "meting",
		meting_api:
			"https://meting.mysqil.com/api?server=:server&type=:type&id=:id&auth=:auth&r=:r",
		id: "14164869977",
		server: "netease",
		type: "playlist",
	},
	license: {
		enable: true,
		name: "CC BY-NC-SA 4.0",
		url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
	},
	comment: {
		enable: false,
		twikoo: {
			envId: "https://twikoo.vercel.app",
			lang: "zh_CN",
		},
	},
	share: {
		enable: true,
	},
	toc: {
		enable: true,
		mode: "sidebar",
		depth: 2,
		useJapaneseBadge: true,
	},
	postListLayout: {
		defaultMode: "list",
		allowSwitch: true,
	},
	wallpaperMode: {
		defaultMode: "banner",
		showModeSwitchOnMobile: "desktop",
	},
	tagStyle: {
		useNewStyle: false,
	},
	pageScaling: {
		enable: true,
		targetWidth: 2000,
	},
	permalink: {
		enable: false,
		format: "%postname%",
	},
	bangumi: {
		userId: "your-bangumi-id",
		fetchOnDev: false,
	},
	bilibili: {
		vmid: "your-bilibili-vmid",
		fetchOnDev: false,
		coverMirror: "",
		useWebp: true,
	},
	anime: {
		mode: "local",
	},
	font: {
		asciiFont: {
			fontFamily: "ZenMaruGothic-Medium",
			fontWeight: "400",
			localFonts: ["ZenMaruGothic-Medium.ttf"],
			enableCompress: true,
		},
		cjkFont: {
			fontFamily: "萝莉体 第二版",
			fontWeight: "500",
			localFonts: ["萝莉体 第二版.ttf"],
			enableCompress: true,
		},
	},
	sakura: {
		enable: true,
		sakuraNum: 21,
		limitTimes: -1,
		size: {
			min: 0.5,
			max: 1.5,
		},
		opacity: {
			min: 0.5,
			max: 1,
		},
		speed: {
			horizontal: {
				min: -2,
				max: 2,
			},
			vertical: {
				min: -2,
				max: 2,
			},
			rotation: 3,
			fadeSpeed: 3,
		},
		zIndex: 0,
	},
	pio: {
		enable: true,
		position: "right",
		width: 250,
		height: 400,
		mode: "fixed",
		hiddenOnMobile: true,
		dialog: {
			welcome: ["欢迎来到我的博客！", "你好呀！"],
			touch: ["好痒呀！", "不要戳我！"],
			home: "点击可以回到首页哦",
			close: "再见啦！",
		},
	},
	footer: {
		enable: false,
		customHtml: "",
	},
};

