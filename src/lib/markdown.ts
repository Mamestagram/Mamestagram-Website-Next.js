export type MarkdownInline =
	| { type: "text" | "code"; text: string }
	| { type: "strong" | "em" | "del"; children: MarkdownInline[] }
	| { type: "link"; href: string; children: MarkdownInline[] }
	| { type: "image"; src: string; alt: string }
	| { type: "break" };

export type MarkdownBlock =
	| { type: "paragraph"; children: MarkdownInline[] }
	| { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: MarkdownInline[] }
	| { type: "code"; text: string; language: string }
	| { type: "quote"; children: MarkdownBlock[] }
	| { type: "list"; ordered: boolean; start: number; items: MarkdownBlock[][] }
	| { type: "rule" };

const MAX_DEPTH = 16;
type ParseBudget = { remaining: number };

export const getMarkdownHref = (value: string): string | null => {
	const href = value.trim().replace(/\\([()])/g, "$1");
	if (!href || /[\s\u0000-\u001f\u007f\\]/.test(href) || href.startsWith("//")) return null;
	if (/^[a-z][a-z\d+.-]*:/i.test(href)) {
		try {
			const url = new URL(href);
			return ["https:", "http:", "mailto:"].includes(url.protocol) ? url.href : null;
		} catch { return null; }
	}
	return href;
};

const findClosing = (text: string, marker: string, from: number, budget: ParseBudget): number => {
	let cursor = from;
	while (cursor < text.length && budget.remaining > 0) {
		const found = text.indexOf(marker, cursor);
		budget.remaining -= (found < 0 ? text.length : found) - cursor + marker.length;
		if (found < 0 || budget.remaining <= 0) return -1;
		let backslashes = 0;
		for (let index = found - 1; index >= 0 && text[index] === "\\"; index--) backslashes++;
		if (backslashes % 2 === 0) return found;
		cursor = found + marker.length;
	}
	return -1;
};

const readLink = (text: string, start: number, budget: ParseBudget) => {
	let bracketDepth = 1, end = start + 1;
	for (; end < text.length && bracketDepth && budget.remaining-- > 0; end++) {
		if (text[end] === "\\") { end++; continue; }
		if (text[end] === "[") bracketDepth++;
		if (text[end] === "]") bracketDepth--;
	}
	if (bracketDepth || text[end] !== "(") return null;
	const destinationStart = end + 1;
	let depth = 1;
	for (end++; end < text.length && depth && budget.remaining-- > 0; end++) {
		if (text[end] === "\\") { end++; continue; }
		if (text[end] === "(") depth++;
		if (text[end] === ")") depth--;
	}
	if (depth) return null;
	const destination = text.slice(destinationStart, end - 1).trim();
	const match = destination.match(/^(?:<([^>]+)>|(\S+?))(?:\s+(?:"[^"]*"|'[^']*'))?$/);
	if (!match) return null;
	const href = getMarkdownHref(match[1] ?? match[2]);
	return href ? { label: text.slice(start + 1, destinationStart - 2), href, end } : null;
};

export const parseMarkdownInline = (text: string, depth = 0, budget: ParseBudget = { remaining: Math.max(1024, text.length * 16) }, allowLinks = true, keepSyntax = false): MarkdownInline[] => {
	if (depth >= MAX_DEPTH) return [{ type: "text", text }];
	const nodes: MarkdownInline[] = [];
	let plain = "", cursor = 0;
	const flush = () => { if (plain) { nodes.push({ type: "text", text: plain }); plain = ""; } };
	while (cursor < text.length && budget.remaining-- > 0) {
		const char = text[cursor];
		if (char === "\\" && /[\p{P}\p{S}]/u.test(text[cursor + 1] ?? "")) { plain += keepSyntax ? text.slice(cursor, cursor + 2) : text[cursor + 1]; cursor += 2; continue; }
		if (char === "\n") { flush(); nodes.push({ type: "break" }); cursor++; continue; }
		if (char === "`") {
			const marker = text.slice(cursor).match(/^`+/)?.[0] ?? "`";
			const close = findClosing(text, marker, cursor + marker.length, budget);
			if (close >= 0) {
				flush();
				let code = text.slice(cursor + marker.length, close).replace(/\n/g, " ");
				if (code.startsWith(" ") && code.endsWith(" ") && code.trim()) code = code.slice(1, -1);
				nodes.push({ type: "code", text: keepSyntax ? text.slice(cursor, close + marker.length) : code }); cursor = close + marker.length; continue;
			}
			if (keepSyntax && marker.length >= 3 && /^ {0,3}$/.test(text.slice(text.lastIndexOf("\n", cursor - 1) + 1, cursor))) {
				flush(); nodes.push({ type: "code", text: text.slice(cursor) }); cursor = text.length; continue;
			}
		}
		const image = text.startsWith("![", cursor);
		if (image || (char === "[" && allowLinks)) {
			const link = readLink(text, cursor + (image ? 1 : 0), budget);
			if (link && (!image || link.href.startsWith("https://"))) {
				if (keepSyntax) { plain += text.slice(cursor, link.end); cursor = link.end; continue; }
				flush();
				nodes.push(image ? { type: "image", src: link.href, alt: link.label } : { type: "link", href: link.href, children: parseMarkdownInline(link.label, depth + 1, budget, false) });
				cursor = link.end; continue;
			}
		}
		if (allowLinks && char === "<") {
			const close = text.indexOf(">", cursor + 1);
			const candidate = close < 0 ? "" : text.slice(cursor + 1, close);
			const href = /^(?:https?:|mailto:)/i.test(candidate) ? getMarkdownHref(candidate) : null;
			if (href) {
				if (keepSyntax) plain += text.slice(cursor, close + 1);
				else { flush(); nodes.push({ type: "link", href, children: [{ type: "text", text: candidate }] }); }
				cursor = close + 1; continue;
			}
		}
		const marker = ["***", "___", "**", "__", "~~", "*", "_"].find((value) => text.startsWith(value, cursor));
		if (marker && !(marker.includes("_") && /[\p{L}\p{N}]/u.test(text[cursor - 1] ?? ""))) {
			const close = findClosing(text, marker, cursor + marker.length, budget);
			if (close > cursor + marker.length) {
				flush();
				const children = parseMarkdownInline(text.slice(cursor + marker.length, close), depth + 1, budget, allowLinks, keepSyntax);
				if (keepSyntax) nodes.push({ type: "text", text: marker });
				nodes.push(marker.length === 3 ? { type: "strong", children: [{ type: "em", children }] } : { type: marker === "~~" ? "del" : marker.length === 2 ? "strong" : "em", children });
				if (keepSyntax) nodes.push({ type: "text", text: marker });
				cursor = close + marker.length; continue;
			}
		}
		plain += char; cursor++;
	}
	plain += text.slice(cursor);
	flush();
	return nodes;
};

export const parseMarkdownInput = (source: string): MarkdownInline[] => parseMarkdownInline(source, 0, undefined, true, true);

const listMarker = (line: string) => line.match(/^( {0,3})([-+*]|\d{1,9}[.)]) +(.*)$/);
const headingMarker = (line: string) => line.match(/^( {0,3})(#{1,6}) +(.*)$/);
const quoteMarker = (line: string) => line.match(/^( {0,3})> (.*)$/);
const fenceMarker = (line: string) => line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);

export type MarkdownInputLine = {
	nodes: MarkdownInline[];
	prefix: string;
	kind: "text" | "quote" | "heading" | "unordered-list" | "ordered-list";
};

const splitInputLines = (nodes: readonly MarkdownInline[]): MarkdownInline[][] => {
	const lines: MarkdownInline[][] = [[]];
	for (const node of nodes) {
		if (node.type === "break") { lines.push([]); continue; }
		if (node.type === "image") { lines[lines.length - 1].push(node); continue; }
		if ("text" in node) {
			for (const [index, text] of node.text.split("\n").entries()) {
				if (index > 0) lines.push([]);
				lines[lines.length - 1].push({ ...node, text });
			}
		} else {
			for (const [index, children] of splitInputLines(node.children).entries()) {
				if (index > 0) lines.push([]);
				lines[lines.length - 1].push({ ...node, children });
			}
		}
	}
	return lines;
};

const startsWithInputCode = (nodes: readonly MarkdownInline[]): boolean => {
	for (const node of nodes) {
		if (node.type === "text") { if (node.text.trim()) return false; continue; }
		if (node.type === "code") return true;
		if ("children" in node) return startsWithInputCode(node.children);
		return false;
	}
	return false;
};

export const parseMarkdownInputLines = (source: string): MarkdownInputLine[] => {
	const lines = splitInputLines(parseMarkdownInput(source));
	const sourceLines = source.split("\n");
	const codeLines = new Set<number>();
	let fence: string | null = null;
	const inputLines = sourceLines.map((text, index) => {
		const nodes = lines[index];
		const plainLine: MarkdownInputLine = { nodes, prefix: "", kind: "text" };
		const marker = fenceMarker(text);
		if (fence) {
			if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
			codeLines.add(index);
			return plainLine;
		}
		if (marker) { fence = marker[1]; codeLines.add(index); return plainLine; }
		if (startsWithInputCode(nodes)) { codeLines.add(index); return plainLine; }
		const heading = headingMarker(text), quote = quoteMarker(text), list = listMarker(text);
		if (!heading && !quote && !list) return plainLine;
		const prefix = heading ? heading[1] + heading[2] : quote ? quote[1] + ">" : list ? list[1] + list[2] : "";
		const kind: MarkdownInputLine["kind"] = heading ? "heading" : quote ? "quote" : list && /^\d/.test(list[2]) ? "ordered-list" : "unordered-list";
		return { nodes: parseMarkdownInput(text.slice(prefix.length)), prefix, kind };
	});
	// Keep inline formatting within paragraphs so list markers cannot become paired emphasis markers.
	let start = 0;
	while (start < inputLines.length) {
		if (inputLines[start].kind !== "text" || codeLines.has(start)) { start++; continue; }
		let end = start + 1;
		while (end < inputLines.length && inputLines[end].kind === "text" && !codeLines.has(end)) end++;
		const paragraph = splitInputLines(parseMarkdownInput(sourceLines.slice(start, end).join("\n")));
		for (let index = start; index < end; index++) inputLines[index].nodes = paragraph[index - start];
		start = end;
	}
	return inputLines;
};

const isRule = (line: string) => /^(?:\*{3,}|-{3,}|_{3,})$/.test(line.trim().replace(/[ \t]/g, ""));
const startsBlock = (line: string) => !!fenceMarker(line) || !!headingMarker(line) || !!quoteMarker(line) || !!listMarker(line) || isRule(line) || /^(?: {4}|\t)/.test(line);

const parseBlocks = (lines: string[], depth: number): MarkdownBlock[] => {
	if (depth >= MAX_DEPTH) return [{ type: "paragraph", children: parseMarkdownInline(lines.join("\n")) }];
	const blocks: MarkdownBlock[] = [];
	let index = 0;
	while (index < lines.length) {
		const line = lines[index];
		if (!line.trim()) { index++; continue; }
		const fence = fenceMarker(line);
		if (fence) {
			const body: string[] = [];
			const close = new RegExp(`^ {0,3}${fence[1][0]}{${fence[1].length},}\\s*$`);
			for (index++; index < lines.length && !close.test(lines[index]); index++) body.push(lines[index]);
			if (index < lines.length) index++;
			blocks.push({ type: "code", text: body.join("\n"), language: fence[2].trim().split(/\s+/)[0] }); continue;
		}
		const heading = headingMarker(line);
		if (heading) {
			blocks.push({ type: "heading", level: heading[2].length as 1 | 2 | 3 | 4 | 5 | 6, children: parseMarkdownInline(heading[3].replace(/\s+#+\s*$/, "")) }); index++; continue;
		}
		if (isRule(line)) { blocks.push({ type: "rule" }); index++; continue; }
		if (quoteMarker(line)) {
			const body: string[] = [];
			while (index < lines.length && quoteMarker(lines[index])) body.push(lines[index++].replace(/^ {0,3}> /, ""));
			blocks.push({ type: "quote", children: parseBlocks(body, depth + 1) }); continue;
		}
		const first = listMarker(line);
		if (first) {
			const ordered = /^\d/.test(first[2]);
			const items: MarkdownBlock[][] = [];
			while (index < lines.length) {
				const marker = listMarker(lines[index]);
				if (!marker || marker[1].length !== first[1].length || /^\d/.test(marker[2]) !== ordered) break;
				const indent = marker[0].length - marker[3].length;
				const body = [marker[3]];
				index++;
				while (index < lines.length) {
					const next = lines[index];
					if (!next.trim()) {
						const following = lines[index + 1] ?? "";
						if (following.startsWith(" ".repeat(indent))) { body.push(""); index++; continue; }
						break;
					}
					if (next.startsWith(" ".repeat(indent))) { body.push(next.slice(indent)); index++; continue; }
					if (startsBlock(next)) break;
					body.push(next); index++;
				}
				items.push(parseBlocks(body, depth + 1));
			}
			blocks.push({ type: "list", ordered, start: ordered ? Number.parseInt(first[2], 10) : 1, items }); continue;
		}
		if (/^(?: {4}|\t)/.test(line)) {
			const body: string[] = [];
			while (index < lines.length && (/^(?: {4}|\t)/.test(lines[index]) || !lines[index].trim())) body.push(lines[index++].replace(/^(?: {4}|\t)/, ""));
			blocks.push({ type: "code", text: body.join("\n").trimEnd(), language: "" }); continue;
		}
		if (index + 1 < lines.length && /^ {0,3}(?:=+|-+)\s*$/.test(lines[index + 1])) {
			blocks.push({ type: "heading", level: lines[index + 1].trim().startsWith("=") ? 1 : 2, children: parseMarkdownInline(line) }); index += 2; continue;
		}
		const paragraph = [line]; index++;
		while (index < lines.length && lines[index].trim() && !startsBlock(lines[index])) paragraph.push(lines[index++]);
		blocks.push({ type: "paragraph", children: parseMarkdownInline(paragraph.join("\n")) });
	}
	return blocks;
};

export const parseMarkdown = (source: string): MarkdownBlock[] => parseBlocks(source.replace(/\r\n?/g, "\n").split("\n"), 0);
