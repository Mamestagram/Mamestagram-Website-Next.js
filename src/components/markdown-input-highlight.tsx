import { Fragment } from "react";
import type { MarkdownInline } from "@/lib/markdown";

export default function MarkdownInputHighlight({ nodes }: Readonly<{ nodes: readonly MarkdownInline[] }>) {
	return nodes.map((node, index) => {
		switch (node.type) {
			case "text": return <Fragment key={index}>{node.text}</Fragment>;
			case "code": return <code key={index}>{node.text}</code>;
			case "break": return <Fragment key={index}>{"\n"}</Fragment>;
			case "strong": return <strong key={index}><MarkdownInputHighlight nodes={node.children}/></strong>;
			case "em": return <em key={index}><MarkdownInputHighlight nodes={node.children}/></em>;
			case "del": return <del key={index}><MarkdownInputHighlight nodes={node.children}/></del>;
			case "link": return <Fragment key={index}>[<MarkdownInputHighlight nodes={node.children}/>]({node.href})</Fragment>;
			case "image": return <Fragment key={index}>{`![${node.alt}](${node.src})`}</Fragment>;
		}
	});
}
