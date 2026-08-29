"use client";

import FontAwesome from "@/components/font-awesome";
import styles from "@s/documents.module.css";

export default function CommandSentence({
	text,
	command,
	copied,
	copyLabel,
	onCopyAction,
}: {
	text: string;
	command: string;
	copied: boolean;
	copyLabel: string;
	onCopyAction: () => Promise<void>;
}) {
	const [before, after = ""] = text.split(command);
	return (
		<>
			{before}
			<button
				type="button"
				className={styles.inline_command}
				data-copied={copied}
				aria-label={`${copyLabel}: ${command}`}
				title={copyLabel}
				onClick={onCopyAction}
			>
				<code>{command}</code>
				<FontAwesome prefix="fad" name={copied ? "check" : "copy"}/>
				<span className={styles.inline_copy_feedback} aria-live="polite">
          {copied ? copyLabel : ""}
        </span>
			</button>
			{after}
		</>
	);
}
