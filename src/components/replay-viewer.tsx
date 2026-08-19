"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
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
	const [dialogState, setDialogState] = useState<"closed" | "open" | "closing">("closed");
	const dialogStateRef = useRef(dialogState);
	const closeTimeoutRef = useRef<number | null>(null);
	const replayId = useId();
	const replayTitleId = useId();
	const openButtonRef = useRef<HTMLButtonElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const isOpen = dialogState !== "closed";
	const openReplay = useCallback(() => {
		if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current);
		dialogStateRef.current = "open";
		setDialogState("open");
	}, []);
	const closeReplay = useCallback(() => {
		if (dialogStateRef.current !== "open") return;
		dialogStateRef.current = "closing";
		setDialogState("closing");
		closeTimeoutRef.current = window.setTimeout(() => {
			dialogStateRef.current = "closed";
			closeTimeoutRef.current = null;
			setDialogState("closed");
		}, 200);
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		const previousOverflow = document.body.style.overflow;
		const returnFocusTarget = openButtonRef.current;
		const closeOnEscape = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape") closeReplay();
		};

		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", closeOnEscape);
		requestAnimationFrame(() => closeButtonRef.current?.focus());

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", closeOnEscape);
			requestAnimationFrame(() => returnFocusTarget?.focus());
		};
	}, [closeReplay, isOpen]);

	useEffect(() => () => {
		if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current);
	}, []);

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
			        onClick={openReplay}>
				{children}
			</button>
			{isOpen && createPortal(
				<div className={styles.replay_backdrop}
				     data-closing={dialogState === "closing"}
				     onMouseDown={(event) => {
					     if (event.target === event.currentTarget) closeReplay();
				     }}>
					<section id={replayId}
					         className={styles.replay_dialog}
					         data-closing={dialogState === "closing"}
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
							        onClick={closeReplay}>
								<FontAwesome prefix="fas" name="xmark"/>
							</button>
						</div>
						<iframe src={replayUrl}
						        title="Mamestagram replay"
						        allow="autoplay; fullscreen"
						        allowFullScreen/>
					</section>
				</div>,
				document.body
			)}
		</>
	);
}
