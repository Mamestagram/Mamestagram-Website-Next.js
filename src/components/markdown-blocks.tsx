import { createElement } from "react";
import MarkdownInline from "@/components/markdown-inline";
import type { MarkdownBlock } from "@/lib/markdown";

export default function MarkdownBlocks({ blocks }: Readonly<{ blocks: readonly MarkdownBlock[] }>) {
	return blocks.map((block, index) => {
		switch (block.type) {
			case "paragraph": return <p key={index}><MarkdownInline nodes={block.children}/></p>;
			case "heading": return createElement(`h${block.level}`, { key: index }, <MarkdownInline nodes={block.children}/>);
			case "code": return <pre key={index}><code data-language={block.language || undefined}>{block.text}</code></pre>;
			case "quote": return <blockquote key={index}><MarkdownBlocks blocks={block.children}/></blockquote>;
			case "rule": return <hr key={index}/>;
			case "list": {
				const children = block.items.map((item, itemIndex) => <li key={itemIndex}><MarkdownBlocks blocks={item}/></li>);
				return block.ordered ? <ol key={index} start={block.start}>{children}</ol> : <ul key={index}>{children}</ul>;
			}
		}
	});
}
