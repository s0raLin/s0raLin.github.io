import {
	getSortedPosts,
	getCategoryList,
	getTagList,
} from "../../utils/content-utils";
import { siteConfig } from "../../config";

export async function GET() {
	// 获取所有文章
	const posts = await getSortedPosts();

	// 获取分类列表
	const categories = await getCategoryList();

	// 获取标签列表
	const tags = await getTagList();

	// 计算总字数
	let totalWords = 0;
	for (const post of posts) {
		if (post.body) {
			let text = post.body;

			// 移除代码块
			text = text.replace(/```[\s\S]*?```/g, "");
			// 移除 ` 包裹的行内代码
			text = text.replace(/`[^`]+`/g, "");

			// CJK 字符正则
			const cjkPattern =
				/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u3000-\u303f\uff00-\uffef]/g;

			const cjkMatches = text.match(cjkPattern);
			const cjkCount = cjkMatches ? cjkMatches.length : 0;

			// 计算非 CJK 单词数
			const nonCjkText = text.replace(cjkPattern, " ");
			const nonCjkWords = nonCjkText
				.split(/\s+/)
				.filter((word) => word.trim().length > 0);

			totalWords += cjkCount + nonCjkWords.length;
		}
	}

	// 计算运行天数
	const siteStartDate = siteConfig.siteStartDate || "2025-01-01";
	const startDate = new Date(siteStartDate);
	const today = new Date();
	const diffTime = Math.abs(today.getTime() - startDate.getTime());
	const runningDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	// 获取最后活动时间（最新文章的发布日期）
	let lastActivity: string | null = null;
	if (posts.length > 0) {
		const latestPost = posts.reduce((latest, post) => {
			if (!latest) return post;
			return post.data.published > latest.data.published ? post : latest;
		}, posts[0]);

		lastActivity = latestPost.data.published.toISOString();
	}

	// 构建统计对象
	const stats = {
		postCount: posts.length,
		categoryCount: categories.length,
		categories: categories.map((c) => ({
			name: c.name,
			count: c.count,
		})),
		tagCount: tags.length,
		tags: tags.map((t) => ({
			name: t.name,
			count: t.count,
		})),
		totalWords: totalWords,
		runningDays: runningDays,
		siteStartDate: siteStartDate,
		lastActivity: lastActivity,
		lastActivityDaysAgo: lastActivity
			? Math.floor(
					Math.abs(
						today.getTime() - new Date(lastActivity).getTime(),
					) /
						(1000 * 60 * 60 * 24),
				)
			: null,
	};

	return new Response(JSON.stringify(stats), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}

