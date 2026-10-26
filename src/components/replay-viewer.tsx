"use client";

import classNames from "classnames";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useUserContext } from "@/components/context/user-provider";
import FontAwesome from "@/components/font-awesome";
import { copyText } from "@/lib/clipboard";
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
	} catch {
		return null;
	}
};

export default function ReplayViewer({ label, replayUrl, buttonLabel, className, children, autoOpen = false, hideTrigger = false, shareHref, onClose }: Readonly<{
	label: string,
	replayUrl: string,
	buttonLabel: string,
	className?: string,
	children: ReactNode,
	autoOpen?: boolean,
	hideTrigger?: boolean,
	shareHref?: string,
	onClose?: () => void
}>) {
	const { userInfo } = useUserContext();
	const [dialogState, setDialogState] = useState<"closed" | "open" | "closing">("closed");
	const [loginTooltip, setLoginTooltip] = useState<{
		left: number,
		top: number,
		side: "up" | "down"
	} | null>(null);
	const dialogStateRef = useRef(dialogState);
	const closeTimeoutRef = useRef<number | null>(null);
	const copyTimeoutRef = useRef<number | null>(null);
	const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const replayId = useId();
	const loginTooltipId = `${replayId}-login-tooltip`;
	const openButtonRef = useRef<HTMLButtonElement>(null);
	const openLinkRef = useRef<HTMLAnchorElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const isOpen = dialogState !== "closed";
	const canWatchReplay = userInfo.isLoggedIn;
	const resolvedButtonLabel = canWatchReplay
		? buttonLabel
		: "Please sign in to watch replays.";
	const replayOrigin = getReplayOrigin(replayUrl);
	const showLoginTooltip = () => {
		const trigger = openLinkRef.current ?? openButtonRef.current;
		if (canWatchReplay || !trigger) return;
		const bounds = trigger.getBoundingClientRect();
		const showBelow = bounds.top < 72;
		setLoginTooltip({
			left: Math.min(
				window.innerWidth - 12,
				Math.max(12, bounds.left + bounds.width / 2)
			),
			top: showBelow ? bounds.bottom + 10 : bounds.top - 10,
			side: showBelow ? "down" : "up"
		});
	};
	const openReplay = useCallback(() => {
		if (!canWatchReplay) return;
		if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current);
		if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current);
		setCopyState("idle");
		announceMediaPlayback("replay");
		dialogStateRef.current = "open";
		setDialogState("open");
	}, [canWatchReplay]);
	const closeReplay = useCallback(() => {
		if (dialogStateRef.current !== "open") return;
		dialogStateRef.current = "closing";
		setDialogState("closing");
		onClose?.();
		closeTimeoutRef.current = window.setTimeout(() => {
			dialogStateRef.current = "closed";
			closeTimeoutRef.current = null;
			setDialogState("closed");
		}, 200);
	}, [onClose]);
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
		if (!autoOpen && !hideTrigger) return;
		const frame = window.requestAnimationFrame(() => {
			if (autoOpen) openReplay();
			else closeReplay();
		});
		return () => window.cancelAnimationFrame(frame);
	}, [autoOpen, closeReplay, hideTrigger, openReplay]);

	const copyReplayLink = async () => {
		if (!shareHref) return;
		const copied = await copyText(new URL(shareHref, window.location.href).href);
		setCopyState(copied ? "copied" : "failed");
		if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current);
		copyTimeoutRef.current = window.setTimeout(() => {
			setCopyState("idle");
			copyTimeoutRef.current = null;
		}, 3000);
	};
	
	useEffect(() => {
		if (!isOpen) return;
		const previousOverflow = document.body.style.overflow;
		const returnFocusTarget = openLinkRef.current ?? openButtonRef.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
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
		if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current);
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
			{!hideTrigger && (shareHref ? <Link ref={openLinkRef}
				href={shareHref} prefetch={false} scroll={false}
				className={classNames(styles.replay_trigger, className)}
				aria-haspopup="dialog" aria-expanded={isOpen} aria-controls={replayId}
				aria-label={resolvedButtonLabel} aria-disabled={!canWatchReplay}
				aria-describedby={!canWatchReplay ? loginTooltipId : undefined}
				title={canWatchReplay ? buttonLabel : undefined}
				onPointerEnter={showLoginTooltip} onPointerLeave={() => setLoginTooltip(null)}
				onClick={(event) => {
					if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
					event.preventDefault();
					openReplay();
				}}>{children}</Link> : <button ref={openButtonRef}
			        className={classNames(styles.replay_trigger, className)}
			        type="button"
			        disabled={!canWatchReplay}
			        aria-haspopup="dialog"
			        aria-expanded={isOpen}
			        aria-controls={replayId}
			        aria-label={resolvedButtonLabel}
			        aria-describedby={!canWatchReplay ? loginTooltipId : undefined}
			        title={canWatchReplay ? buttonLabel : undefined}
			        onPointerEnter={showLoginTooltip}
			        onPointerLeave={() => setLoginTooltip(null)}
			        onClick={openReplay}>
				{children}
			</button>)}
			{loginTooltip && createPortal(
				<span id={loginTooltipId}
				      className={styles.login_tooltip}
				      data-side={loginTooltip.side}
				      data-theme-independent="true"
				      role="tooltip"
				      style={{ left: loginTooltip.left, top: loginTooltip.top }}>
					Please sign in to watch replays.
				</span>,
				document.body
			)}
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
							{shareHref && <button type="button" className={styles.copy_link} onClick={copyReplayLink} title="Copy replay link">
								<FontAwesome prefix="fas" name={copyState === "copied" ? "check" : "link"}/>
								<span>{copyState === "copied" ? "Copied!" : "Copy link"}</span>
							</button>}
							{copyState !== "idle" && <span className={styles.copy_status} role="status">
								{copyState === "copied" ? "Replay link copied." : "Could not copy. Copy the link from your address bar."}
							</span>}
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
