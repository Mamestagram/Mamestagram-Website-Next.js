import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MarkdownInline as InlineNode } from "@/lib/markdown";

export default function MarkdownInline({ nodes }: Readonly<{ nodes: readonly InlineNode[] }>) {
	return nodes.map((node, index) => {
		switch (node.type) {
			case "text": return <Fragment key={index}>{node.text}</Fragment>;
			case "code": return <code key={index}>{node.text}</code>;
			case "break": return <br key={index}/>;
			case "strong": return <strong key={index}><MarkdownInline nodes={node.children}/></strong>;
			case "em": return <em key={index}><MarkdownInline nodes={node.children}/></em>;
			case "del": return <del key={index}><MarkdownInline nodes={node.children}/></del>;
			case "image": return <Image key={index} src={node.src} alt={node.alt || "Markdown image"} width={800} height={450} unoptimized draggable={false}/>;
			case "link": return /^(?:https?:|mailto:)/i.test(node.href)
				? <a key={index} href={node.href} target="_blank" rel="noopener noreferrer"><MarkdownInline nodes={node.children}/></a>
				: <Link key={index} href={node.href}><MarkdownInline nodes={node.children}/></Link>;
		}
	});
}
