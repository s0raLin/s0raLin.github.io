import { useState, useEffect } from "react";
import {
	Form,
	Input,
	Switch,
	Button,
	Card,
	Tabs,
	InputNumber,
	DatePicker,
	Select,
	ColorPicker,
	message,
} from "antd";
import dayjs from "dayjs";
import type { BlogConfig } from "../types/config";
import { initialConfig } from "../data/initialConfig";

const { TextArea } = Input;

interface ConfigEditorProps {
	onSave?: (config: BlogConfig) => void;
}

const timezoneOptions = Array.from({ length: 25 }, (_, i) => ({
	value: i - 12,
	label: `UTC${i - 12 >= 0 ? "+" : ""}${i - 12}`,
}));

const languageOptions = [
	{ value: "zh_CN", label: "简体中文" },
	{ value: "zh_TW", label: "繁體中文" },
	{ value: "en", label: "English" },
	{ value: "ja", label: "日本語" },
	{ value: "ko", label: "한국어" },
];

const ConfigEditor: React.FC<ConfigEditorProps> = ({ onSave }) => {
	const [form] = Form.useForm();
	const [config, setConfig] = useState<BlogConfig>(initialConfig);
	const [activeTab, setActiveTab] = useState("site");

	useEffect(() => {
		form.setFieldsValue({
			...config,
			siteStartDate: config.site.siteStartDate
				? dayjs(config.site.siteStartDate)
				: null,
		});
	}, [config, form]);

	const handleValuesChange = (changedValues: Record<string, unknown>) => {
		setConfig((prev) => ({
			...prev,
			...changedValues,
		}));
	};

	const handleSave = () => {
		const values = form.getFieldsValue();
		if (values.siteStartDate) {
			values.site = {
				...values.site,
				siteStartDate: values.siteStartDate.format("YYYY-MM-DD"),
			};
		}
		delete values.siteStartDate;
		setConfig(values);
		if (onSave) {
			onSave(values);
		}
		message.success("配置已保存");
	};

	const handleExport = () => {
		const json = JSON.stringify(config, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "blog-config.json";
		a.click();
		URL.revokeObjectURL(url);
		message.success("配置已导出");
	};

	const tabItems = [
		{
			key: "site",
			label: "站点设置",
			children: (
				<Card title="基本设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item label="网站标题" name={["site", "title"]}>
							<Input />
						</Form.Item>
						<Form.Item label="副标题" name={["site", "subtitle"]}>
							<Input />
						</Form.Item>
						<Form.Item label="网站URL" name={["site", "siteURL"]}>
							<Input />
						</Form.Item>
						<Form.Item label="建站日期" name="siteStartDate">
							<DatePicker
								style={{ width: "100%" }}
								format="YYYY-MM-DD"
							/>
						</Form.Item>
						<Form.Item label="时区" name={["site", "timeZone"]}>
							<Select
								options={timezoneOptions}
								placeholder="选择时区"
							/>
						</Form.Item>
						<Form.Item label="语言" name={["site", "lang"]}>
							<Select
								options={languageOptions}
								placeholder="选择语言"
							/>
						</Form.Item>
						<Form.Item label="主题色">
							<ColorPicker
								defaultValue="#F5D500"
								onChange={(color) => {
									setConfig((prev) => ({
										...prev,
										site: {
											...prev.site,
											themeColor: {
												...prev.site.themeColor,
												hue: color.toHsb().h,
											},
										},
									}));
								}}
							/>
						</Form.Item>
						<Form.Item
							label="固定主题色"
							name={["site", "themeColor", "fixed"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="显示最后修改时间"
							name={["site", "showLastModified"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="在内容中显示封面"
							name={["site", "showCoverInContent"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="生成OpenGraph图片"
							name={["site", "generateOgImages"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "features",
			label: "功能开关",
			children: (
				<Card title="页面功能开关" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="番剧页面"
							name={["featurePages", "anime"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="日记页面"
							name={["featurePages", "diary"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="友链页面"
							name={["featurePages", "friends"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="项目页面"
							name={["featurePages", "projects"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="技能页面"
							name={["featurePages", "skills"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="时间线页面"
							name={["featurePages", "timeline"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="相册页面"
							name={["featurePages", "albums"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="设备页面"
							name={["featurePages", "devices"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "banner",
			label: "横幅设置",
			children: (
				<Card title="横幅设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item label="位置" name={["banner", "position"]}>
							<Select
								options={[
									{ value: "top", label: "顶部" },
									{ value: "center", label: "居中" },
									{ value: "bottom", label: "底部" },
								]}
							/>
						</Form.Item>
						<Form.Item
							label="启用轮播"
							name={["banner", "carousel", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="轮播间隔(秒)"
							name={["banner", "carousel", "interval"]}
						>
							<InputNumber
								step={0.5}
								min={1}
								max={10}
								style={{ width: "100%" }}
							/>
						</Form.Item>
						<Form.Item
							label="启用水波纹"
							name={["banner", "waves", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="性能模式"
							name={["banner", "waves", "performanceMode"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="移动端禁用"
							name={["banner", "waves", "mobileDisable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "homeText",
			label: "首页文字",
			children: (
				<Card title="首页文字设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="启用"
							name={["banner", "homeText", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="主标题"
							name={["banner", "homeText", "title"]}
						>
							<Input />
						</Form.Item>
						<Form.Item label="副标题(每行一个)">
							<TextArea
								rows={6}
								defaultValue={config.banner.homeText.subtitle.join(
									"\n",
								)}
								onChange={(e) => {
									const lines = e.target.value.split("\n");
									setConfig((prev) => ({
										...prev,
										banner: {
											...prev.banner,
											homeText: {
												...prev.banner.homeText,
												subtitle: lines,
											},
										},
									}));
								}}
							/>
						</Form.Item>
						<Form.Item
							label="启用打字机效果"
							name={[
								"banner",
								"homeText",
								"typewriter",
								"enable",
							]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="打字速度(ms)"
							name={["banner", "homeText", "typewriter", "speed"]}
						>
							<InputNumber style={{ width: "100%" }} />
						</Form.Item>
						<Form.Item
							label="删除速度(ms)"
							name={[
								"banner",
								"homeText",
								"typewriter",
								"deleteSpeed",
							]}
						>
							<InputNumber style={{ width: "100%" }} />
						</Form.Item>
						<Form.Item
							label="暂停时间(ms)"
							name={[
								"banner",
								"homeText",
								"typewriter",
								"pauseTime",
							]}
						>
							<InputNumber style={{ width: "100%" }} />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "profile",
			label: "个人资料",
			children: (
				<Card title="个人资料设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="头像路径"
							name={["profile", "avatar"]}
						>
							<Input />
						</Form.Item>
						<Form.Item label="名称" name={["profile", "name"]}>
							<Input />
						</Form.Item>
						<Form.Item label="简介" name={["profile", "bio"]}>
							<TextArea rows={3} />
						</Form.Item>
						<Form.Item
							label="启用打字机效果"
							name={["profile", "typewriter", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="打字速度(ms)"
							name={["profile", "typewriter", "speed"]}
						>
							<InputNumber style={{ width: "100%" }} />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "announcement",
			label: "公告设置",
			children: (
				<Card title="公告设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="标题"
							name={["announcement", "title"]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label="内容"
							name={["announcement", "content"]}
						>
							<TextArea rows={4} />
						</Form.Item>
						<Form.Item
							label="可关闭"
							name={["announcement", "closable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="启用链接"
							name={["announcement", "link", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="链接文本"
							name={["announcement", "link", "text"]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label="链接地址"
							name={["announcement", "link", "url"]}
						>
							<Input />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "music",
			label: "音乐播放器",
			children: (
				<Card title="音乐播放器设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="启用"
							name={["musicPlayer", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item label="模式" name={["musicPlayer", "mode"]}>
							<Select
								options={[
									{ value: "local", label: "本地" },
									{ value: "meting", label: "Meting API" },
								]}
							/>
						</Form.Item>
						<Form.Item
							label="API地址"
							name={["musicPlayer", "meting_api"]}
						>
							<Input />
						</Form.Item>
						<Form.Item label="歌单ID" name={["musicPlayer", "id"]}>
							<Input />
						</Form.Item>
						<Form.Item
							label="服务器"
							name={["musicPlayer", "server"]}
						>
							<Select
								options={[
									{ value: "netease", label: "网易云音乐" },
									{ value: "tencent", label: "QQ音乐" },
									{ value: "kugou", label: "酷狗音乐" },
									{ value: "xiami", label: "虾米音乐" },
									{ value: "baidu", label: "百度音乐" },
								]}
							/>
						</Form.Item>
						<Form.Item label="类型" name={["musicPlayer", "type"]}>
							<Input />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "comment",
			label: "评论设置",
			children: (
				<Card title="评论设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="启用"
							name={["comment", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="Twikoo环境ID"
							name={["comment", "twikoo", "envId"]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label="语言"
							name={["comment", "twikoo", "lang"]}
						>
							<Select options={languageOptions} />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "toc",
			label: "目录设置",
			children: (
				<Card title="目录设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="启用"
							name={["toc", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item label="模式" name={["toc", "mode"]}>
							<Select
								options={[
									{ value: "float", label: "悬浮按钮" },
									{ value: "sidebar", label: "侧边栏" },
								]}
							/>
						</Form.Item>
						<Form.Item label="深度" name={["toc", "depth"]}>
							<InputNumber
								min={1}
								max={6}
								style={{ width: "100%" }}
							/>
						</Form.Item>
						<Form.Item
							label="使用日文标记"
							name={["toc", "useJapaneseBadge"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "sakura",
			label: "樱花特效",
			children: (
				<Card title="樱花特效设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="启用"
							name={["sakura", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="樱花数量"
							name={["sakura", "sakuraNum"]}
						>
							<InputNumber style={{ width: "100%" }} />
						</Form.Item>
						<Form.Item
							label="最小尺寸"
							name={["sakura", "size", "min"]}
						>
							<InputNumber step={0.1} style={{ width: "100%" }} />
						</Form.Item>
						<Form.Item
							label="最大尺寸"
							name={["sakura", "size", "max"]}
						>
							<InputNumber step={0.1} style={{ width: "100%" }} />
						</Form.Item>
						<Form.Item
							label="最小透明度"
							name={["sakura", "opacity", "min"]}
						>
							<InputNumber step={0.1} style={{ width: "100%" }} />
						</Form.Item>
						<Form.Item
							label="最大透明度"
							name={["sakura", "opacity", "max"]}
						>
							<InputNumber step={0.1} style={{ width: "100%" }} />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "pio",
			label: "看板娘",
			children: (
				<Card title="看板娘设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="启用"
							name={["pio", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item label="位置" name={["pio", "position"]}>
							<Select
								options={[
									{ value: "left", label: "左侧" },
									{ value: "right", label: "右侧" },
								]}
							/>
						</Form.Item>
						<Form.Item label="宽度" name={["pio", "width"]}>
							<InputNumber style={{ width: "100%" }} />
						</Form.Item>
						<Form.Item label="高度" name={["pio", "height"]}>
							<InputNumber style={{ width: "100%" }} />
						</Form.Item>
						<Form.Item label="模式" name={["pio", "mode"]}>
							<Select
								options={[
									{ value: "fixed", label: "固定" },
									{ value: "absolute", label: "绝对定位" },
								]}
							/>
						</Form.Item>
						<Form.Item
							label="移动端隐藏"
							name={["pio", "hiddenOnMobile"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "font",
			label: "字体设置",
			children: (
				<Card title="字体设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="英文字体"
							name={["font", "asciiFont", "fontFamily"]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label="英文字体粗细"
							name={["font", "asciiFont", "fontWeight"]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label="启用字体压缩"
							name={["font", "asciiFont", "enableCompress"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="中日韩字体"
							name={["font", "cjkFont", "fontFamily"]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label="中日韩字体粗细"
							name={["font", "cjkFont", "fontWeight"]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label="启用字体压缩"
							name={["font", "cjkFont", "enableCompress"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "license",
			label: "许可协议",
			children: (
				<Card title="许可协议设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="启用"
							name={["license", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item label="名称" name={["license", "name"]}>
							<Input />
						</Form.Item>
						<Form.Item label="链接" name={["license", "url"]}>
							<Input />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "footer",
			label: "页脚设置",
			children: (
				<Card title="页脚设置" size="small">
					<Form
						form={form}
						layout="vertical"
						onValuesChange={handleValuesChange}
					>
						<Form.Item
							label="启用"
							name={["footer", "enable"]}
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
						<Form.Item
							label="自定义HTML"
							name={["footer", "customHtml"]}
						>
							<TextArea rows={4} />
						</Form.Item>
					</Form>
				</Card>
			),
		},
	];

	return (
		<div style={{ padding: "20px" }}>
			<div
				style={{
					marginBottom: 20,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<h1>Mizuki 博客配置管理</h1>
				<div>
					<Button
						type="primary"
						onClick={handleSave}
						style={{ marginRight: 10 }}
					>
						保存配置
					</Button>
					<Button onClick={handleExport}>导出配置</Button>
				</div>
			</div>
			<Tabs
				activeKey={activeTab}
				onChange={setActiveTab}
				items={tabItems}
				style={{
					background: "#fff",
					padding: "10px",
					borderRadius: "8px",
				}}
			/>
		</div>
	);
};

export default ConfigEditor;

