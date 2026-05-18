type MarkupGenerator = (content: string, attr?: string) => string;

export abstract class BBTags {
	private markup: MarkupGenerator;
	private readonly noNesting: boolean;
	private readonly insertLineBreaks: boolean;
	
	public NoNesting() {
		return this.noNesting;
	}
	
	public InsertLineBreaks() {
		return this.insertLineBreaks;
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
	private bbTags: {
		tagName: string,
		generator: BBTags
	}[];
	
	public constructor(bbTags: { [bbTagName: string]: BBTags }) {
		this.bbTags = [];
		Object.entries(bbTags).forEach(([tagName, generator]) => { this.bbTags.push({ tagName, generator }); });
	}
	
	// TODO 後回し
	public parseToHtml(text: string) {
		// no nesting tags
		this.bbTags.filter(({ generator }) => generator.NoNesting()).forEach((bbTag) => {
		
		});
	}
}