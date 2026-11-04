import MarkdownBlocks from "@/components/markdown-blocks";
import { parseMarkdown } from "@/lib/markdown";
import styles from "@s/markdown.module.css";

export default function Markdown({ source, className }: Readonly<{ source: string; className?: string }>) {
	return <div className={[styles.markdown, className].filter(Boolean).join(" ")}><MarkdownBlocks blocks={parseMarkdown(source)}/></div>;
}
