// 博客配置类型定义

export interface ThemeColor {
	hue: number;
	fixed: boolean;
}

export interface SiteConfig {
	title: string;
	subtitle: string;
	siteURL: string;
	siteStartDate: string;
	timeZone: number;
	lang: string;
	themeColor: ThemeColor;
	showLastModified: boolean;
	showCoverInContent: boolean;
	generateOgImages: boolean;
}

export interface FeaturePages {
	anime: boolean;
	diary: boolean;
	friends: boolean;
	projects: boolean;
	skills: boolean;
	timeline: boolean;
	albums: boolean;
	devices: boolean;
}

export interface NavbarTitle {
	mode: string;
	text: string;
	icon: string;
	logo: string;
}

export interface BannerCarousel {
	enable: boolean;
	interval: number;
}

export interface BannerWaves {
	enable: boolean;
	performanceMode: boolean;
	mobileDisable: boolean;
}

export interface BannerTypewriter {
	enable: boolean;
	speed: number;
	deleteSpeed: number;
	pauseTime: number;
}

export interface BannerHomeText {
	enable: boolean;
	title: string;
	subtitle: string[];
	typewriter: BannerTypewriter;
}

export interface BannerCredit {
	enable: boolean;
	text: string;
	url: string;
}

export interface BannerConfig {
	desktop: string[];
	mobile: string[];
	position: string;
	carousel: BannerCarousel;
	waves: BannerWaves;
	homeText: BannerHomeText;
	credit: BannerCredit;
}

export interface ProfileLink {
	name: string;
	icon: string;
	url: string;
}

export interface ProfileTypewriter {
	enable: boolean;
	speed: number;
}

export interface ProfileConfig {
	avatar: string;
	name: string;
	bio: string;
	typewriter: ProfileTypewriter;
	links: ProfileLink[];
}

export interface AnnouncementLink {
	enable: boolean;
	text: string;
	url: string;
	external: boolean;
}

export interface AnnouncementConfig {
	title: string;
	content: string;
	closable: boolean;
	link: AnnouncementLink;
}

export interface MusicPlayerConfig {
	enable: boolean;
	mode: string;
	meting_api: string;
	id: string;
	server: string;
	type: string;
}

export interface LicenseConfig {
	enable: boolean;
	name: string;
	url: string;
}

export interface TwikooConfig {
	envId: string;
	lang: string;
}

export interface CommentConfig {
	enable: boolean;
	twikoo: TwikooConfig;
}

export interface ShareConfig {
	enable: boolean;
}

export interface TocConfig {
	enable: boolean;
	mode: string;
	depth: number;
	useJapaneseBadge: boolean;
}

export interface PostListLayout {
	defaultMode: string;
	allowSwitch: boolean;
}

export interface WallpaperMode {
	defaultMode: string;
	showModeSwitchOnMobile: string;
}

export interface TagStyle {
	useNewStyle: boolean;
}

export interface PageScaling {
	enable: boolean;
	targetWidth: number;
}

export interface PermalinkConfig {
	enable: boolean;
	format: string;
}

export interface BangumiConfig {
	userId: string;
	fetchOnDev: boolean;
}

export interface BilibiliConfig {
	vmid: string;
	fetchOnDev: boolean;
	coverMirror: string;
	useWebp: boolean;
}

export interface AnimeConfig {
	mode: string;
}

export interface FontConfig {
	asciiFont: {
		fontFamily: string;
		fontWeight: string;
		localFonts: string[];
		enableCompress: boolean;
	};
	cjkFont: {
		fontFamily: string;
		fontWeight: string;
		localFonts: string[];
		enableCompress: boolean;
	};
}

export interface SakuraSize {
	min: number;
	max: number;
}

export interface SakuraOpacity {
	min: number;
	max: number;
}

export interface SakuraSpeedHorizontal {
	min: number;
	max: number;
}

export interface SakuraSpeedVertical {
	min: number;
	max: number;
}

export interface SakuraSpeed {
	horizontal: SakuraSpeedHorizontal;
	vertical: SakuraSpeedVertical;
	rotation: number;
	fadeSpeed: number;
}

export interface SakuraConfig {
	enable: boolean;
	sakuraNum: number;
	limitTimes: number;
	size: SakuraSize;
	opacity: SakuraOpacity;
	speed: SakuraSpeed;
	zIndex: number;
}

export interface PioDialog {
	welcome: string[];
	touch: string[];
	home: string;
	close: string;
}

export interface PioConfig {
	enable: boolean;
	position: string;
	width: number;
	height: number;
	mode: string;
	hiddenOnMobile: boolean;
	dialog: PioDialog;
}

export interface FooterConfig {
	enable: boolean;
	customHtml: string;
}

export interface BlogConfig {
	site: SiteConfig;
	featurePages: FeaturePages;
	navbarTitle: NavbarTitle;
	banner: BannerConfig;
	profile: ProfileConfig;
	announcement: AnnouncementConfig;
	musicPlayer: MusicPlayerConfig;
	license: LicenseConfig;
	comment: CommentConfig;
	share: ShareConfig;
	toc: TocConfig;
	postListLayout: PostListLayout;
	wallpaperMode: WallpaperMode;
	tagStyle: TagStyle;
	pageScaling: PageScaling;
	permalink: PermalinkConfig;
	bangumi: BangumiConfig;
	bilibili: BilibiliConfig;
	anime: AnimeConfig;
	font: FontConfig;
	sakura: SakuraConfig;
	pio: PioConfig;
	footer: FooterConfig;
}
