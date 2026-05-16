import { BBTags, BBSimpleTag, BBTag } from "./parser";

const bbTags: { [bbTagName: string]: BBTags } = {};
// simple tags
bbTags["heading"] = new BBSimpleTag("h2"); // [heading]content[/heading] -> <h2>content</h2>
bbTags["b"] = new BBSimpleTag("strong"); // [b]content[/b] -> <strong>content</strong>
bbTags["i"] = new BBSimpleTag("em"); // [i]content[/i] -> <em>content</em>
bbTags["u"] = new BBSimpleTag("u"); // [u]content[/u] -> <u>content</u>
bbTags["s"] = new BBSimpleTag("del"); // [s]content[/s] -> <del>content</del>
bbTags["c"] = new BBSimpleTag("code", true); // [c]content[/c] -> <code>content</code> (no nesting)
bbTags["code"] = new BBSimpleTag("pre", true); // [code]content[/code] -> <pre>content</pre> (no nesting)
bbTags["center"] = new BBSimpleTag("center"); // [center]content[/center] -> <center>content</center>

// [color=attr]content[/color]
bbTags["color"] = new BBTag((_tagName, content, attr) => `<span style="color: ${attr};">${content}</span>`);
// [size=attr]content[/size]
bbTags["size"] = new BBTag((_tagName, content, attr) => `<span style="font-size: ${attr}%">${content}</span>`);
// [spoiler]content[/spoiler]
bbTags["spoiler"] = new BBTag((tagName, content) => `<span class="${tagName}">${content}</span>`);
// [box(=attr)]content[/box]
bbTags["box"] = new BBTag((_tagName, content, attr) => {
	const name = attr ?? "SPOILER";
	let spoilerBox: string = "";
	spoilerBox += `<div class="spoilerbox">\n`;
	spoilerBox += `\t<p><i class="fa-solid fa-caret-right"></i><span>${name}</span></p>`;
	spoilerBox += `\t<div>${content}</div>\n`;
	spoilerBox += "</div>";
	return spoilerBox;
});
// [list(=attr)][*]content[/list]
bbTags["list"] = new BBTag((_tagName, content, attr) => {
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
	list += `<ol style="list-style-type: ${listStyleTypes[attr ?? "disc"]};">\n`;
	content.split("[*]").forEach((item) => { list += `\t<li>${item}</li>\n`; });
	list += "</ol>";
	return list;
});
// [quote(=attr)]content[/quote]
bbTags["quote"] = new BBTag((_tagName, content, attr) => {
	const name = attr !== undefined ? `${attr} wrote:` : "";
	let quote: string = "";
	quote += "<blockquote>\n";
	quote += `\t<h4>${name}</h4>\n`;
	quote += `\t${content}\n`;
	quote += "</blockquote>";
	return quote;
});
// [url(=url)]content[/url]
bbTags["url"] = new BBTag((_tagName, content, attr) => {
	const link = attr ?? content;
	const url = !/^(http:\/\/|https:\/\/)/.test(link) ? `https://${link}` : link;
	return `<a class="default-link" href="${url}">${content}</a>`;
});
// [img(=attr)]content[/img]
bbTags["img"] = new BBTag((_tagName, content, attr) =>
	`<img src="${content.replaceAll(/"/, "")}" decoding="async" loading="lazy" alt="${attr ?? ""}" />`);
// [profile]content[profile]
bbTags["profile"] = new BBTag((_tagName, content, attr) => `<a class="user-link" href="/profile/${attr}/std">${content}</a>`);