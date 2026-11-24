import MarkdownInputHighlight from "@/components/markdown-input-highlight";
import type { MarkdownInputLine } from "@/lib/markdown";
import styles from "@s/markdown-input.module.css";

export default function MarkdownInputLines({ lines }: Readonly<{ lines: readonly MarkdownInputLine[] }>) {
	return lines.map((line, index) => <span key={index} className={styles.input_line}
		data-kind={line.kind} data-marker-indent={line.prefix.length - line.prefix.trimStart().length}>
		{line.prefix && <span className={styles.input_marker}>{line.kind === "unordered-list" ? line.prefix.slice(0, -1) + "•" : line.prefix}</span>}
		<MarkdownInputHighlight nodes={line.nodes}/>
	</span>);
}
