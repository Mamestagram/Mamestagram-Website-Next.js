type MarkupGenerator = (content: string, attr?: string) => string;
const MAX_NESTING_DEPTH = 32;

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
	private readonly bbTags: Map<string, BBTags>;
	
	public constructor(bbTags: { [bbTagName: string]: BBTags }) {
		this.bbTags = new Map();
		Object.entries(bbTags).forEach(([tagName, generator]) => {
			this.bbTags.set(tagName.toLowerCase(), generator);
		});
	}
	
	public parseToHtml(text: string) {
		return this.parseSegment(text, 0);
	}
	
	private parseSegment(text: string, depth: number): string {
		if (depth >= MAX_NESTING_DEPTH) return this.escapeText(text);
		
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
			
			const closeTag = this.findClosingTag(text, openTag.name, openTag.end, !generator.NoNesting());
			if (!closeTag) {
				html += this.escapeText(text.slice(openStart, openTag.end));
				cursor = openTag.end;
				continue;
			}
			
			const innerText = text.slice(openTag.end, closeTag.start);
			const content = generator.NoNesting()
				? this.escapeText(innerText, generator.InsertLineBreaks())
				: this.parseSegment(innerText, depth + 1);
			html += generator.Generate(content, openTag.attr);
			cursor = closeTag.end;
		}
		
		return html;
	}
	
	private escapeText(text: string, insertLineBreaks: boolean = true) {
		const escaped = escapeHtml(text);
		return insertLineBreaks ? escaped.replaceAll(/\r\n|\r|\n/g, "<br />\n") : escaped;
	}
	
	private readOpeningTag(text: string, start: number) {
		const closeBracket = text.indexOf("]", start);
		if (closeBracket === -1) return null;
		
		const raw = text.slice(start + 1, closeBracket);
		const match = raw.match(/^([a-z][a-z0-9_-]*)([\s\S]*)$/i);
		if (!match) return null;
		const rest = match[2].trim();
		
		return {
			name: match[1].toLowerCase(),
			attr: rest ? this.readTagAttribute(rest) : undefined,
			end: closeBracket + 1
		};
	}
	
	private readTagAttribute(raw: string) {
		let value = raw;
		if (value.startsWith("=")) value = value.slice(1).trim();
		else {
			const namedAttribute = value.match(/^(?:val|link)\s*=\s*([\s\S]*)$/i);
			if (namedAttribute) value = namedAttribute[1].trim();
		}
		
		if (value.length >= 2) {
			const first = value[0], last = value.at(-1);
			if ((first === "\"" && last === "\"") || (first === "'" && last === "'"))
				value = value.slice(1, -1);
		}
		return value;
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
	
	private findClosingTag(text: string, tagName: string, start: number, allowNesting: boolean) {
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
			if (allowNesting && openingTag?.name === tagName) {
				depth++;
				cursor = openingTag.end;
				continue;
			}
			
			cursor = bracket + 1;
		}
		
		return null;
	}
}
