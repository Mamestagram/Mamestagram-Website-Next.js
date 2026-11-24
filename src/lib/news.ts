import { isHomeUpdateId, type HomeUpdateCategory } from "@/lib/home-updates";
import { parseMarkdown, type MarkdownBlock, type MarkdownInline } from "@/lib/markdown";

export const parseNewsId = (value: unknown): number | null => {
	if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
	const id = Number(value);
	return isHomeUpdateId(id) ? id : null;
};

export const getNewsHref = (category: HomeUpdateCategory | null = null, before?: number): string => {
	const params = new URLSearchParams();
	if (category) params.set("category", category);
	if (before !== undefined) params.set("before", String(before));
	return `/news${params.size ? `?${params}` : ""}`;
};

const inlineText = (nodes: readonly MarkdownInline[]): string => nodes.map((node) => {
	if ("text" in node) return node.text;
	if ("children" in node) return inlineText(node.children);
	return node.type === "image" ? node.alt : " ";
}).join("");

const blockText = (blocks: readonly MarkdownBlock[]): string => blocks.map((block) => {
	if (block.type === "code") return block.text;
	if (block.type === "rule") return "";
	if (block.type === "list") return block.items.map(blockText).join(" ");
	if (block.type === "quote") return blockText(block.children);
	return inlineText(block.children);
}).join(" ");

export const getNewsExcerpt = (source: string): string => {
	const text = blockText(parseMarkdown(source)).replace(/\s+/g, " ").trim();
	const characters = Array.from(text);
	return characters.length > 180 ? characters.slice(0, 180).join("").trimEnd() + "…" : text || "No additional details.";
};
