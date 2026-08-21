"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import FontAwesome from "@/components/font-awesome";
import type { DocumentsData, Locale } from "@/app/api/documents/route";
import styles from "@s/documents.module.css";

type DocumentText = DocumentsData["copy"][Locale];
type ConnectImages = DocumentsData["connectImages"][Locale];
type LegacyCopyDocument = {
	execCommand: (command: "copy") => boolean
};

const copyWithSelection = (text: string) => {
	const textarea = document.createElement("textarea");
	const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
	textarea.value = text;
	textarea.readOnly = true;
	textarea.style.position = "fixed";
	textarea.style.inset = "0 auto auto -9999px";
	document.body.append(textarea);
	textarea.select();
	textarea.setSelectionRange(0, text.length);

	try {
		return (document as unknown as LegacyCopyDocument).execCommand("copy");
	}
	catch {
		return false;
	}
	finally {
		textarea.remove();
		previousFocus?.focus();
	}
};

const copyText = async (text: string) => {
	if (typeof navigator.clipboard?.writeText !== "function") return copyWithSelection(text);
	try {
		await navigator.clipboard.writeText(text);
		return true;
	}
	catch {
		return copyWithSelection(text);
	}
};

export default function ConnectGuide({ text, images, launchOption }: {
	text: DocumentText,
	images: ConnectImages,
	launchOption: string
}) {
	const [copied, setCopied] = useState(false);
	const copiedTimer = useRef<number | null>(null);

	useEffect(() => () => {
		if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
	}, []);

	const copyLaunchOption = async () => {
		const copiedSuccessfully = await copyText(launchOption);
		if (!copiedSuccessfully) return;
		setCopied(true);
		if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
		copiedTimer.current = window.setTimeout(() => setCopied(false), 1800);
	};

	return (
		<>
			<button type="button" className={styles.command_box} data-page-enter="box" onClick={copyLaunchOption} aria-label={`${text.copy}: ${launchOption}`}>
				<span><small>{text.copyCommand}</small><code>{launchOption}</code></span>
				<span className={styles.copy_status} data-copied={copied}>
					<FontAwesome prefix="fad" name={copied ? "check" : "copy"}/>{copied ? text.copied : text.copy}
				</span>
			</button>
			<ol className={styles.steps}>
				{text.connectSteps.map((step, index) =>
					<li key={step} data-page-enter="box">
						<span className={styles.step_number}>{String(index + 1).padStart(2, "0")}</span>
						<div className={styles.step_body}>
							<p>{index === 5
								? <CommandSentence text={step} command={launchOption} copied={copied} copyLabel={copied ? text.copied : text.copy} onCopy={copyLaunchOption}/>
								: step}</p>
							{images[index].length > 0 &&
								<div className={styles.step_images} data-count={images[index].length} data-step={index + 1}>
									{images[index].map((image, imageIndex) =>
										<Image key={image.src}
										       {...image}
										       alt={`Connection step ${index + 1} image ${imageIndex + 1}`}
										       draggable={false}/>)}
								</div>}
						</div>
					</li>)}
			</ol>
			<div className={styles.success_message} data-page-enter="box">
				<FontAwesome prefix="fad" name="circle-check"/>
				<strong>{text.connected}</strong>
			</div>
		</>
	);
}

function CommandSentence({ text, command, copied, copyLabel, onCopy }: {
	text: string,
	command: string,
	copied: boolean,
	copyLabel: string,
	onCopy: () => Promise<void>
}) {
	const [before, after = ""] = text.split(command);
	return <>{before}<button type="button"
	                         className={styles.inline_command}
	                         data-copied={copied}
	                         aria-label={`${copyLabel}: ${command}`}
	                         title={copyLabel}
	                         onClick={onCopy}>
		<code>{command}</code>
		<FontAwesome prefix="fad" name={copied ? "check" : "copy"}/>
		<span className={styles.inline_copy_feedback} aria-live="polite">{copied ? copyLabel : ""}</span>
	</button>{after}</>;
}
