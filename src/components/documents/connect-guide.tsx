"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import FontAwesome from "@/components/font-awesome";
import type { DocumentsData, Locale } from "@/app/api/documents/route";
import styles from "@s/documents.module.css";

type DocumentText = DocumentsData["copy"][Locale];
type ConnectImages = DocumentsData["connectImages"][Locale];

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
		await navigator.clipboard.writeText(launchOption);
		setCopied(true);
		if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
		copiedTimer.current = window.setTimeout(() => setCopied(false), 1800);
	};

	return (
		<>
			<button type="button" className={styles.command_box} onClick={copyLaunchOption} aria-label={`${text.copy}: ${launchOption}`}>
				<span><small>{text.copyCommand}</small><code>{launchOption}</code></span>
				<span className={styles.copy_status} data-copied={copied}>
					<FontAwesome prefix="fad" name={copied ? "check" : "copy"}/>{copied ? text.copied : text.copy}
				</span>
			</button>
			<ol className={styles.steps}>
				{text.connectSteps.map((step, index) =>
					<li key={step}>
						<span className={styles.step_number}>{String(index + 1).padStart(2, "0")}</span>
						<div className={styles.step_body}>
							<p>{index === 5
								? <CommandSentence text={step} command={launchOption} copied={copied} copyLabel={copied ? text.copied : text.copy} onCopy={copyLaunchOption}/>
								: step}</p>
							{images[index].length > 0 &&
								<div className={styles.step_images} data-count={images[index].length} data-step={index + 1}>
									{images[index].map((image) =>
										<Image key={image.src} {...image} alt="" draggable={false}/>)}
								</div>}
						</div>
					</li>)}
			</ol>
			<div className={styles.success_message}>
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
