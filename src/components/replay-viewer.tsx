"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import {
	announceMediaPlayback,
	getMediaPlaybackSource,
	isReplayPlayMessage,
	MEDIA_PLAYBACK_EVENT,
	REPLAY_PAUSE_MESSAGE
} from "@/lib/media-playback";
import styles from "@s/replay-viewer.module.css";

const getReplayOrigin = (replayUrl: string) => {
	try {
		return new URL(replayUrl).origin;
	}
	catch {
		return null;
	}
};

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
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const replayId = useId();
	const openButtonRef = useRef<HTMLButtonElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const isOpen = dialogState !== "closed";
	const replayOrigin = getReplayOrigin(replayUrl);
	const openReplay = useCallback(() => {
		if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current);
		announceMediaPlayback("replay");
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
	const pauseReplay = useCallback(() => {
		if (dialogStateRef.current !== "open") return;
		if (replayOrigin) {
			iframeRef.current?.contentWindow?.postMessage(
				{ type: REPLAY_PAUSE_MESSAGE },
				replayOrigin
			);
		}

		const iframe = iframeRef.current;
		if (iframe) iframe.src = "about:blank";
		closeReplay();
	}, [closeReplay, replayOrigin]);

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

	useEffect(() => {
		const pauseForPreview = (event: Event) => {
			if (getMediaPlaybackSource(event) === "preview") pauseReplay();
		};
		const announceReplayFromIframe = () => {
			window.requestAnimationFrame(() => {
				if (document.activeElement === iframeRef.current) announceMediaPlayback("replay");
			});
		};
		const receiveReplayMessage = (event: MessageEvent<unknown>) => {
			if (!replayOrigin || event.origin !== replayOrigin) return;
			if (event.source !== iframeRef.current?.contentWindow) return;
			if (isReplayPlayMessage(event.data)) announceMediaPlayback("replay");
		};

		window.addEventListener(MEDIA_PLAYBACK_EVENT, pauseForPreview);
		window.addEventListener("blur", announceReplayFromIframe);
		window.addEventListener("message", receiveReplayMessage);
		return () => {
			window.removeEventListener(MEDIA_PLAYBACK_EVENT, pauseForPreview);
			window.removeEventListener("blur", announceReplayFromIframe);
			window.removeEventListener("message", receiveReplayMessage);
		};
	}, [pauseReplay, replayOrigin]);

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
					         aria-label={`Mamestagram replay: ${label}`}>
						<div className={styles.replay_toolbar}>
							<button ref={closeButtonRef}
							        type="button"
							        aria-label="Close replay"
							        onClick={closeReplay}>
								<FontAwesome prefix="fas" name="xmark"/>
							</button>
						</div>
						<iframe ref={iframeRef}
						        src={replayUrl}
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
