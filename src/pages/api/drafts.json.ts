import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

// 草稿箱目录路径
const DRAFTS_BASE_PATH = "src/content/drafts";

// 确保目录存在
function ensureDirectoryExists(dirPath: string) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

// 获取草稿列表
function getDraftList(type: "posts" | "diary"): any[] {
	const dirPath = path.join(process.cwd(), DRAFTS_BASE_PATH, type);

	if (!fs.existsSync(dirPath)) {
		return [];
	}

	const files = fs.readdirSync(dirPath);
	const drafts: any[] = [];

	for (const file of files) {
		if (file.endsWith(".md") || file.endsWith(".mdx")) {
			const filePath = path.join(dirPath, file);
			const content = fs.readFileSync(filePath, "utf-8");

			// 解析 frontmatter
			const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
			let metadata: any = { title: file.replace(/\.mdx?$/, "") };

			if (frontmatterMatch) {
				const frontmatter = frontmatterMatch[1];
				frontmatter.split("\n").forEach((line) => {
					const [key, ...valueParts] = line.split(":");
					if (key && valueParts.length > 0) {
						const value = valueParts.join(":").trim();
						// 移除引号
						metadata[key.trim()] = value.replace(
							/^["']|["']$/g,
							"",
						);
					}
				});
			}

			// 获取正文内容（去除 frontmatter）
			let body = content;
			if (frontmatterMatch) {
				body = content.substring(frontmatterMatch[0].length).trim();
			}

			drafts.push({
				id: file.replace(/\.mdx?$/, ""),
				filename: file,
				...metadata,
				body: body,
				wordCount: body.length,
				createdAt: metadata.created || new Date().toISOString(),
				updatedAt: metadata.updated || new Date().toISOString(),
			});
		}
	}

	// 按更新时间排序
	return drafts.sort(
		(a, b) =>
			new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
	);
}

// 保存草稿
function saveDraft(
	type: "posts" | "diary",
	id: string,
	data: { title?: string; body?: string; category?: string; tags?: string[] },
): { success: boolean; message: string; id?: string } {
	const dirPath = path.join(process.cwd(), DRAFTS_BASE_PATH, type);
	ensureDirectoryExists(dirPath);

	const filename = `${id}.md`;
	const filePath = path.join(dirPath, filename);

	const now = new Date().toISOString();

	// 构建 frontmatter
	const frontmatter = [
		"---",
		`title: "${data.title || id}"`,
		`created: "${now}"`,
		`updated: "${now}"`,
		data.category ? `category: "${data.category}"` : null,
		data.tags && data.tags.length > 0
			? `tags: [${data.tags.map((t) => `"${t}"`).join(", ")}]`
			: null,
		"---",
	]
		.filter(Boolean)
		.join("\n");

	const content = `${frontmatter}\n\n${data.body || ""}`;

	try {
		fs.writeFileSync(filePath, content, "utf-8");
		return { success: true, message: "草稿保存成功", id };
	} catch (error) {
		return { success: false, message: `保存失败: ${error}` };
	}
}

// 删除草稿
function deleteDraft(
	type: "posts" | "diary",
	id: string,
): { success: boolean; message: string } {
	const dirPath = path.join(process.cwd(), DRAFTS_BASE_PATH, type);
	const filename = `${id}.md`;
	const filePath = path.join(dirPath, filename);

	if (!fs.existsSync(filePath)) {
		return { success: false, message: "草稿不存在" };
	}

	try {
		fs.unlinkSync(filePath);
		return { success: true, message: "草稿删除成功" };
	} catch (error) {
		return { success: false, message: `删除失败: ${error}` };
	}
}

// GET - 获取草稿列表
export const GET: APIRoute = async ({ url }) => {
	const type = url.searchParams.get("type") as "posts" | "diary" | null;

	if (!type || (type !== "posts" && type !== "diary")) {
		// 返回所有草稿
		const posts = getDraftList("posts");
		const diary = getDraftList("diary");

		return new Response(
			JSON.stringify({
				posts: { count: posts.length, items: posts },
				diary: { count: diary.length, items: diary },
			}),
			{
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	const drafts = getDraftList(type);

	return new Response(
		JSON.stringify({
			type,
			count: drafts.length,
			items: drafts,
		}),
		{
			headers: { "Content-Type": "application/json" },
		},
	);
};

// POST - 新增草稿
export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { type, title, content, category, tags } = body;

		if (!type || (type !== "posts" && type !== "diary")) {
			return new Response(
				JSON.stringify({ success: false, message: "无效的类型" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// 生成唯一 ID
		const id = title
			? title
					.toLowerCase()
					.replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
					.replace(/-+/g, "-")
					.replace(/^-|-$/g, "")
			: `draft-${Date.now()}`;

		const result = saveDraft(type, id, {
			title: title || id,
			body: content,
			category,
			tags,
		});

		return new Response(JSON.stringify(result), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				message: `请求处理失败: ${error}`,
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
};

// PUT - 更新草稿
export const PUT: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { type, id, title, content, category, tags } = body;

		if (!type || !id) {
			return new Response(
				JSON.stringify({ success: false, message: "缺少必要参数" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const result = saveDraft(type, id, {
			title,
			body: content,
			category,
			tags,
		});

		return new Response(JSON.stringify(result), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		return new Response(
			JSON.stringify({ success: false, message: `更新失败: ${error}` }),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
};

// DELETE - 删除草稿
export const DELETE: APIRoute = async ({ url }) => {
	const type = url.searchParams.get("type");
	const id = url.searchParams.get("id");

	if (!type || !id) {
		return new Response(
			JSON.stringify({ success: false, message: "缺少必要参数" }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}

	const result = deleteDraft(type as "posts" | "diary", id);

	return new Response(JSON.stringify(result), {
		headers: { "Content-Type": "application/json" },
	});
};

