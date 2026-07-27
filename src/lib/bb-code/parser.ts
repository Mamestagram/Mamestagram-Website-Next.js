type MarkupGenerator = (content: string, attr?: string) => string;

export function escapeHtml(text: string) {
	return text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll("\"", "&quot;")
		.replaceAll("'", "&#039;");
}

export function escapeAttribute(text: string) {
	return escapeHtml(text).replaceAll("`", "&#096;");
}

export abstract class BBTags {
	private readonly markup: MarkupGenerator;
	private readonly noNesting: boolean;
	private readonly insertLineBreaks: boolean;
	
	public NoNesting() {
		return this.noNesting;
	}
	
	public InsertLineBreaks() {
		return this.insertLineBreaks;
	}
	
	public Generate(content: string, attr?: string) {
		return this.markup(content, attr);
	}
	
	protected constructor(markup: MarkupGenerator, noNesting: boolean, insertLineBreaks: boolean) {
		this.markup = markup;
		this.noNesting = noNesting;
		this.insertLineBreaks = insertLineBreaks;
	}
}

export class BBSimpleTag extends BBTags {
	public constructor(htmlTagName: string, noNesting: boolean = false, insertLineBreaks: boolean = true) {
		super((cotent) => `<${htmlTagName}>${cotent}</${htmlTagName}>`, noNesting, insertLineBreaks);
	}
}

export class BBTag extends BBTags {
	public constructor(markup: MarkupGenerator, noNesting: boolean = false, insertLineBreaks: boolean = true) {
		super(markup, noNesting, insertLineBreaks);
	}
}

export class BBCodeParser {
	private bbTags: Map<string, BBTags>;
	
	public constructor(bbTags: { [bbTagName: string]: BBTags }) {
		this.bbTags = new Map();
		Object.entries(bbTags).forEach(([tagName, generator]) => {
			this.bbTags.set(tagName.toLowerCase(), generator);
		});
	}
	
	public parseToHtml(text: string) {
		return this.parseSegment(text);
	}
	
	private parseSegment(text: string): string {
		let html = "";
		let cursor = 0;
		
		while (cursor < text.length) {
			const openStart = text.indexOf("[", cursor);
			if (openStart === -1) {
				html += this.escapeText(text.slice(cursor));
				break;
			}
			
			html += this.escapeText(text.slice(cursor, openStart));
			
			const openTag = this.readOpeningTag(text, openStart);
			if (!openTag) {
				html += this.escapeText(text[openStart]);
				cursor = openStart + 1;
				continue;
			}
			
			const generator = this.bbTags.get(openTag.name);
			if (!generator) {
				html += this.escapeText(text.slice(openStart, openTag.end));
				cursor = openTag.end;
				continue;
			}
			
			const closeTag = this.findClosingTag(text, openTag.name, openTag.end);
			if (!closeTag) {
				html += this.escapeText(text.slice(openStart, openTag.end));
				cursor = openTag.end;
				continue;
			}
			
			const innerText = text.slice(openTag.end, closeTag.start);
			const content = generator.NoNesting() ? escapeHtml(innerText) : this.parseSegment(innerText);
			html += generator.Generate(content, openTag.attr);
			cursor = closeTag.end;
		}
		
		return html;
	}
	
	private escapeText(text: string) {
		return this.escapeTextWithAutoLinks(text).replaceAll(/\r\n|\r|\n/g, "<br />\n");
	}
	
	private escapeTextWithAutoLinks(text: string) {
		const urlPattern = /https?:\/\/[^\s<>"']+/gi;
		let html = "";
		let cursor = 0;
		let match: RegExpExecArray | null;
		
		while ((match = urlPattern.exec(text)) !== null) {
			const url = match[0];
			html += escapeHtml(text.slice(cursor, match.index));
			
			const trailing = url.match(/[),.!?;:。！？、]+$/)?.[0] ?? "";
			const href = url.slice(0, url.length - trailing.length);
			html += href
				? `<a class="default-link" href="${escapeAttribute(href)}">${escapeHtml(href)}</a>${escapeHtml(trailing)}`
				: escapeHtml(url);
			cursor = match.index + url.length;
		}
		
		html += escapeHtml(text.slice(cursor));
		return html;
	}
	
	private readOpeningTag(text: string, start: number) {
		const closeBracket = text.indexOf("]", start);
		if (closeBracket === -1) return null;
		
		const raw = text.slice(start + 1, closeBracket);
		const match = raw.match(/^([a-z][a-z0-9_-]*)(?:(?:=|\s+)([\s\S]*))?$/i);
		if (!match) return null;
		
		return {
			name: match[1].toLowerCase(),
			attr: this.readTagAttribute(match[2]),
			end: closeBracket + 1
		};
	}
	
	private readTagAttribute(attr?: string) {
		if (!attr) return undefined;
		
		const trimmed = attr.trim();
		const valMatch = trimmed.match(/^val\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))$/i);
		if (valMatch) return valMatch[1] ?? valMatch[2] ?? valMatch[3];
		
		return trimmed;
	}
	
	private readClosingTag(text: string, start: number, tagName: string) {
		const closeBracket = text.indexOf("]", start);
		if (closeBracket === -1) return null;
		
		const raw = text.slice(start + 1, closeBracket).trim().toLowerCase();
		if (raw !== `/${tagName}`) return null;
		
		return {
			start,
			end: closeBracket + 1
		};
	}
	
	private findClosingTag(text: string, tagName: string, start: number) {
		let depth = 1;
		let cursor = start;
		
		while (cursor < text.length) {
			const bracket = text.indexOf("[", cursor);
			if (bracket === -1) return null;
			
			const closingTag = this.readClosingTag(text, bracket, tagName);
			if (closingTag) {
				depth--;
				if (depth === 0) return closingTag;
				cursor = closingTag.end;
				continue;
			}
			
			const openingTag = this.readOpeningTag(text, bracket);
			if (openingTag?.name === tagName) {
				depth++;
				cursor = openingTag.end;
				continue;
			}
			
			cursor = bracket + 1;
		}
		
		return null;
	}
}
