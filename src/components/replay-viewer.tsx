"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/replay-viewer.module.css";

export default function ReplayViewer({ label, replayUrl, buttonLabel, className, children }: Readonly<{
	label: string,
	replayUrl: string,
	buttonLabel: string,
	className?: string,
	children: ReactNode
}>) {
	const [isOpen, setIsOpen] = useState(false);
	const replayId = useId();
	const replayTitleId = useId();
	const openButtonRef = useRef<HTMLButtonElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const previousOverflow = document.body.style.overflow;
		const returnFocusTarget = openButtonRef.current;
		const closeReplay = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape") setIsOpen(false);
		};

		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", closeReplay);
		requestAnimationFrame(() => closeButtonRef.current?.focus());

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", closeReplay);
			requestAnimationFrame(() => returnFocusTarget?.focus());
		};
	}, [isOpen]);

	return (
		<>
			<button ref={openButtonRef}
			        className={className}
			        type="button"
			        aria-haspopup="dialog"
			        aria-expanded={isOpen}
			        aria-controls={replayId}
			        aria-label={buttonLabel}
			        title={buttonLabel}
			        onClick={() => setIsOpen(true)}>
				{children}
			</button>
			{isOpen && createPortal(
				<section id={replayId}
				         className={styles.replay_fullscreen}
				         role="dialog"
				         aria-modal="true"
				         aria-labelledby={replayTitleId}>
					<div className={styles.replay_toolbar}>
						<span>
							<FontAwesome prefix="fad" name="circle-play"/>
							<span>
								<small>Mamestagram replay</small>
								<strong id={replayTitleId}>{label}</strong>
							</span>
						</span>
						<button ref={closeButtonRef}
						        type="button"
						        aria-label="Close replay"
						        onClick={() => setIsOpen(false)}>
							<FontAwesome prefix="fas" name="xmark"/>
						</button>
					</div>
					<iframe src={replayUrl}
					        title="Mamestagram replay"
					        allow="autoplay; fullscreen"
					        allowFullScreen/>
				</section>,
				document.body
			)}
		</>
	);
}
