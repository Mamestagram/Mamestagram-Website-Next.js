import { BBCodeParser, BBTags, BBSimpleTag, BBTag, escapeAttribute, escapeHtml } from "./parser";
import styles from "@s/profile.module.css";

function sanitizeUrl(url: string) {
	const trimmed = url.trim();
	const withProtocol = /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
	const normalized = withProtocol.startsWith("//") ? `https:${withProtocol}` : withProtocol;
	
	try {
		const parsed = new URL(normalized);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
		return parsed.toString();
	} catch {
		return null;
	}
}

function isSecureImageUrl(url: string) {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "https:";
	} catch {
		return false;
	}
}

function renderImage(url: string, alt: string = "") {
	return [
		`<span class="${styles.image_wrapper}">`,
		`<img data-bbcode-image="true" src="${escapeAttribute(url)}" decoding="async" loading="lazy" alt="${escapeAttribute(alt)}" />`,
		`<span class="${styles.image_error}">Image could not be loaded</span>`,
		"</span>"
	].join("");
}

function renderImageMessage(message: string) {
	return `<span class="${styles.image_message}">${escapeHtml(message)}</span>`;
}

function textFromHtml(html: string) {
	return html
		.replaceAll(/<[^>]*>/g, "")
		.replaceAll("&amp;", "&")
		.replaceAll("&quot;", "\"")
		.replaceAll("&#039;", "'")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">");
}

function sanitizeColor(color?: string) {
	if (!color) return null;
	const trimmed = color.trim();
	return /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed) ? trimmed : null;
}

function sanitizeSize(size?: string) {
	const parsed = Number(size);
	if (!Number.isFinite(parsed)) return null;
	return Math.min(Math.max(parsed, 50), 300);
}

const bbTags: { [bbTagName: string]: BBTags } = {};
// simple tags
bbTags["heading"] = new BBSimpleTag("h2"); // [heading]content[/heading] -> <h2>content</h2>
bbTags["b"] = new BBSimpleTag("strong"); // [b]content[/b] -> <strong>content</strong>
bbTags["i"] = new BBSimpleTag("em"); // [i]content[/i] -> <em>content</em>
bbTags["u"] = new BBSimpleTag("u"); // [u]content[/u] -> <u>content</u>
bbTags["s"] = new BBSimpleTag("del"); // [s]content[/s] -> <del>content</del>
bbTags["c"] = new BBSimpleTag("code", true, false); // [c]content[/c] -> <code>content</code> (no nesting)
bbTags["code"] = new BBSimpleTag("pre", true, false); // [code]content[/code] -> <pre>content</pre> (no nesting)
bbTags["center"] = new BBTag((content) => `<div class="${styles.centered}">${content}</div>`);

// [color=attr]content[/color]
bbTags["color"] = new BBTag((content, attr) => {
	const color = sanitizeColor(attr);
	if (!color) return content;
	return `<span style="color: ${escapeAttribute(color)};">${content}</span>`;
});
// [size=attr]content[/size]
bbTags["size"] = new BBTag((content, attr) => {
	const size = sanitizeSize(attr);
	if (!size) return content;
	return `<span style="font-size: ${size}%;">${content}</span>`;
});
// [spoiler]content[/spoiler]
bbTags["spoiler"] = new BBTag((content) => `<span class="${styles.spoiler}">${content}</span>`);
// [box(=attr)]content[/box]
bbTags["box"] = new BBTag((content, attr) => {
	const name = escapeHtml(attr?.trim() || "SPOILER");
	return [
		`<details class="${styles.spoilerbox}">`,
		`<summary>${name}</summary>`,
		`<div>${content}</div>`,
		"</details>"
	].join("\n");
});
// [list(=attr)][*]content[/list]
bbTags["list"] = new BBTag((content, attr) => {
	const listStyleTypes: Record<string, string> = {
		none: "none",
		disc: "disc",
		circle: "circle",
		square: "square",
		dec: "decimal",
		["dec-zero"]: "decimal-leading-zero",
		["roman-s"]: "lower-roman",
		["roman-l"]: "upper-roman",
		["greek"]: "lower-greek",
		cjk: "cjk-ideographic",
		hebrew: "hebrew",
		armenian: "armenian",
		georgian: "georgian",
		hira: "hiragana",
		["hira-iroha"]: "hiragana-iroha",
		kata: "katakana",
		["kata-iroha"]: "katakana-iroha",
		["alpha-s"]: "lower-alpha",
		["alpha-l"]: "upper-alpha"
	};
	const type = attr?.trim().toLowerCase() || "disc";
	const normalizedType = type in listStyleTypes ? type : "disc";
	const listStyle = listStyleTypes[normalizedType];
	const items = content
		.split("[*]")
		.slice(1)
		.map((item) => item
			.replace(/^(?:\s*<br \/>\n?)+|(?:<br \/>\n?\s*)+$/g, "")
			.trim())
		.filter(Boolean);
	if (items.length === 0) return content;
	
	const tag = ["none", "disc", "circle", "square"].includes(normalizedType) ? "ul" : "ol";
	return [
		`<${tag} style="list-style-type: ${listStyle};">`,
		...items.map((item) => `\t<li>${item}</li>`),
		`</${tag}>`
	].join("\n");
});
// [quote(=attr)]content[/quote]
bbTags["quote"] = new BBTag((content, attr) => {
	const name = attr?.trim();
	return [
		"<blockquote>",
		...(name ? [`\t<h4>${escapeHtml(name)} wrote:</h4>`] : []),
		`\t${content}`,
		"</blockquote>"
	].join("\n");
});
// [url(=url)]content[/url]
bbTags["url"] = new BBTag((content, attr) => {
	const link = attr ?? textFromHtml(content);
	const url = sanitizeUrl(link);
	if (!url) return content;
	return `<a class="default-link" href="${escapeAttribute(url)}">${content}</a>`;
});
// [img(=attr)]content[/img]
bbTags["img"] = new BBTag((content) => {
	const imageUrl = sanitizeUrl(textFromHtml(content));
	if (!imageUrl) return renderImageMessage("Image URL is invalid");
	if (!isSecureImageUrl(imageUrl)) return renderImageMessage("Image URL must use HTTPS");
	return renderImage(imageUrl);
}, true, false);
// [profile=7]content[/profile]
bbTags["profile"] = new BBTag((content, attr) => {
	const id = (attr ?? textFromHtml(content)).trim();
	if (!id || !/^\d+$/.test(id)) return content;
	return `<a class="${styles.user_link}" href="/profile/${encodeURIComponent(id)}/std">${content}</a>`;
});

export const bbCodeParser = new BBCodeParser(bbTags);
export default bbTags;
