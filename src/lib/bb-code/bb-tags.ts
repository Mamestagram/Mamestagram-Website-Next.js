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
	}
	catch {
		return null;
	}
}

function isAllowedImageUrl(url: string) {
	const baseDomain = process.env.BASE_DOMAIN;
	const allowedHosts = new Set([
		baseDomain ? `a.${baseDomain}` : null,
		baseDomain ? `clan-a.${baseDomain}` : null,
		baseDomain ? `assets.${baseDomain}` : null,
		"assets.mamesosu.net",
		"assets.ppy.sh",
		"i.imgur.com",
		"cdn.discordapp.com",
		"media.discordapp.net",
		"images-ext-1.discordapp.net",
		"images-ext-2.discordapp.net",
		"raw.githubusercontent.com",
		"user-images.githubusercontent.com",
		"avatars.githubusercontent.com",
		"upload.wikimedia.org",
		"pbs.twimg.com",
		"abs.twimg.com",
		"cdn.bsky.app",
		"media.tenor.com",
		"c.tenor.com",
		"media.giphy.com",
		"i.giphy.com",
		"static-cdn.jtvnw.net",
		"images.unsplash.com"
	].filter((host): host is string => host !== null));

	try {
		const parsed = new URL(url);
		return parsed.protocol === "https:" && allowedHosts.has(parsed.hostname);
	}
	catch {
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
	if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) return trimmed;
	if (/^[0-9a-f]{3}([0-9a-f]{3})?([0-9a-f]{2})?$/i.test(trimmed)) return `#${trimmed}`;
	if (/^[a-z]+$/i.test(trimmed)) return trimmed;
	if (/^(rgb|rgba|hsl|hsla)\([\d\s,%.+-]+\)$/i.test(trimmed)) return trimmed;
	return null;
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
bbTags["center"] = new BBSimpleTag("center"); // [center]content[/center] -> <center>content</center>

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
	const name = escapeHtml(attr ?? "SPOILER");
	let spoilerBox: string = "";
	spoilerBox += `<div class="${styles.spoilerbox}">\n`;
	spoilerBox += `\t<p><i class="fa-solid fa-caret-right"></i><span>${name}</span></p>`;
	spoilerBox += `\t<div>${content}</div>\n`;
	spoilerBox += "</div>";
	return spoilerBox;
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
	let list: string = "";
	list += `<ol style="list-style-type: ${listStyleTypes[attr ?? "disc"] ?? "disc"};">\n`;
	content
		.split("[*]")
		.filter((item) => item.replaceAll(/<br \/>\s*/g, "").trim() !== "")
		.forEach((item) => { list += `\t<li>${item}</li>\n`; });
	list += "</ol>";
	return list;
});
// [quote(=attr)]content[/quote]
bbTags["quote"] = new BBTag((content, attr) => {
	const name = attr !== undefined ? `${escapeHtml(attr)} wrote:` : "";
	let quote: string = "";
	quote += "<blockquote>\n";
	quote += `\t<h4>${name}</h4>\n`;
	quote += `\t${content}\n`;
	quote += "</blockquote>";
	return quote;
});
// [url(=url)]content[/url]
bbTags["url"] = new BBTag((content, attr) => {
	const link = attr ?? textFromHtml(content);
	const url = sanitizeUrl(link);
	if (!url) return content;
	return `<a class="default-link" href="${escapeAttribute(url)}">${content}</a>`;
});
// [img(=attr)]content[/img]
bbTags["img"] = new BBTag((content, attr) => {
	const imageUrl = sanitizeUrl(textFromHtml(content));
	if (!imageUrl) return renderImageMessage("Image URL is invalid");
	if (!isAllowedImageUrl(imageUrl)) return renderImageMessage("Image domain is not allowed");
	return renderImage(imageUrl, attr);
}, true, false);
// [profile=7]content[/profile] or [profile]7[/profile]
bbTags["profile"] = new BBTag((content, attr) => {
	const id = (attr ?? textFromHtml(content)).trim();
	if (!id || !/^\d+$/.test(id)) return content;
	return `<a class="${styles.user_link}" href="/profile/${encodeURIComponent(id)}/std">${content}</a>`;
});

export const bbCodeParser = new BBCodeParser(bbTags);
export default bbTags;
