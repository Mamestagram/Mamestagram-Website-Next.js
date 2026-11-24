"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import MarkdownInputLines from "@/components/markdown-input-lines";
import { parseMarkdownInputLines } from "@/lib/markdown";
import styles from "@s/markdown-input.module.css";

export default function MarkdownInput({ value, onChange, disabled = false, rows = 6, maxLength }: Readonly<{
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	rows?: number;
	maxLength?: number;
}>) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const viewportRef = useRef<HTMLSpanElement>(null);
	const highlightRef = useRef<HTMLSpanElement>(null);
	const [isComposing, setIsComposing] = useState(false);
	const lines = useMemo(() => parseMarkdownInputLines(value), [value]);
	const syncHighlight = () => {
		const textarea = textareaRef.current, viewport = viewportRef.current, highlight = highlightRef.current;
		if (!textarea || !viewport || !highlight) return;
		viewport.style.left = `${textarea.clientLeft}px`;
		viewport.style.top = `${textarea.clientTop}px`;
		viewport.style.width = `${textarea.clientWidth}px`;
		viewport.style.height = `${textarea.clientHeight}px`;
		highlight.style.width = `${textarea.clientWidth}px`;
		highlight.style.transform = `translate(${-textarea.scrollLeft}px, ${-textarea.scrollTop}px)`;
	};
	useLayoutEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const observer = new ResizeObserver(syncHighlight);
		observer.observe(textarea);
		syncHighlight();
		return () => observer.disconnect();
	}, []);
	useLayoutEffect(syncHighlight, [value]);

	return <span className={styles.editor} data-composing={isComposing} data-disabled={disabled}>
		<span ref={viewportRef} className={styles.highlight_viewport} aria-hidden="true">
			<span ref={highlightRef} className={styles.highlight_text}><MarkdownInputLines lines={lines}/></span>
		</span>
		<textarea ref={textareaRef} className={styles.input} value={value} disabled={disabled} rows={rows} maxLength={maxLength}
			spellCheck={false} wrap="soft" onScroll={syncHighlight}
			onChange={(event) => { onChange(event.currentTarget.value); syncHighlight(); }}
			onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}/>
	</span>;
}
