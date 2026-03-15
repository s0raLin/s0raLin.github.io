import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

// 文章正式目录
const POSTS_PATH = path.join(process.cwd(), "src/content/posts");
// 日记数据文件
const DIARY_DATA_PATH = path.join(process.cwd(), "src/data/diary.ts");

// 发布文章草稿
function publishPost(id: string): {
	success: boolean;
	message: string;
	url?: string;
} {
	const draftPath = path.join(
		process.cwd(),
		"src/content/drafts/posts",
		`${id}.md`,
	);

	if (!fs.existsSync(draftPath)) {
		return { success: false, message: "草稿不存在" };
	}

	// 读取草稿内容
	const content = fs.readFileSync(draftPath, "utf-8");

	// 更新 frontmatter，添加 published 字段
	let newContent = content;
	if (content.includes("published:")) {
		newContent = content.replace(/published:.*\n/, `published: true\n`);
	} else {
		newContent = content.replace(/^---/, `---\npublished: true`);
	}

	// 写入正式目录
	const targetPath = path.join(POSTS_PATH, `${id}.md`);
	fs.writeFileSync(targetPath, newContent, "utf-8");

	// 删除草稿
	fs.unlinkSync(draftPath);

	return {
		success: true,
		message: "文章发布成功",
		url: `/posts/${id}/`,
	};
}

// 发布日记草稿
function publishDiary(id: string): {
	success: boolean;
	message: string;
	entry?: any;
} {
	const draftPath = path.join(
		process.cwd(),
		"src/content/drafts/diary",
		`${id}.md`,
	);

	if (!fs.existsSync(draftPath)) {
		return { success: false, message: "草稿不存在" };
	}

	// 读取草稿内容
	const content = fs.readFileSync(draftPath, "utf-8");

	// 解析 frontmatter 和正文
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	let metadata: any = {};
	let body = content;

	if (frontmatterMatch) {
		const frontmatter = frontmatterMatch[1];
		frontmatter.split("\n").forEach((line) => {
			const [key, ...valueParts] = line.split(":");
			if (key && valueParts.length > 0) {
				const value = valueParts.join(":").trim();
				metadata[key.trim()] = value.replace(/^["']|["']$/g, "");
			}
		});
		body = content.substring(frontmatterMatch[0].length).trim();
	}

	// 读取现有的日记数据
	let diaryData: any[] = [];
	if (fs.existsSync(DIARY_DATA_PATH)) {
		const fileContent = fs.readFileSync(DIARY_DATA_PATH, "utf-8");
		const match = fileContent.match(
			/const diaryData: DiaryItem\[\] = \[[\s\S]*\];/,
		);
		if (match) {
			try {
				// 简单的 JSON 解析
				const jsonStr = match[0]
					.replace("const diaryData: DiaryItem[] = ", "")
					.replace(/;/, "");
				diaryData = eval("(" + jsonStr + ")");
			} catch (e) {
				console.error("解析日记数据失败:", e);
			}
		}
	}

	// 生成新日记条目
	const newEntry = {
		id:
			diaryData.length > 0
				? Math.max(...diaryData.map((d: any) => d.id)) + 1
				: 1,
		content: body || metadata.title || "",
		date: metadata.created || new Date().toISOString(),
		images: metadata.images
			? metadata.images.split(",").map((s: string) => s.trim())
			: [],
		location: metadata.location || "",
		mood: metadata.mood || "",
		tags: metadata.tags
			? metadata.tags.split(",").map((s: string) => s.trim())
			: [],
	};

	diaryData.push(newEntry);

	// 更新 diary.ts 文件
	const newFileContent = `// 日记数据配置
// 用于管理日记页面的数据

export interface DiaryItem {
	id: number;
	content: string;
	date: string;
	images?: string[];
	location?: string;
	mood?: string;
	tags?: string[];
}

// 日记数据（由草稿箱发布自动生成）
const diaryData: DiaryItem[] = ${JSON.stringify(diaryData, null, 4)};

${fs.readFileSync(DIARY_DATA_PATH, "utf-8").split("const diaryData: DiaryItem[] = ")[0]}

export default diaryData;
`;

	fs.writeFileSync(DIARY_DATA_PATH, newFileContent, "utf-8");

	// 删除草稿
	fs.unlinkSync(draftPath);

	return {
		success: true,
		message: "日记发布成功",
		entry: newEntry,
	};
}

// POST - 发布草稿
export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { type, id } = body;

		if (!type || !id) {
			return new Response(
				JSON.stringify({ success: false, message: "缺少必要参数" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		if (type === "posts") {
			const result = publishPost(id);
			return new Response(JSON.stringify(result), {
				headers: { "Content-Type": "application/json" },
			});
		} else if (type === "diary") {
			const result = publishDiary(id);
			return new Response(JSON.stringify(result), {
				headers: { "Content-Type": "application/json" },
			});
		} else {
			return new Response(
				JSON.stringify({ success: false, message: "无效的类型" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	} catch (error) {
		return new Response(
			JSON.stringify({ success: false, message: `发布失败: ${error}` }),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
};

