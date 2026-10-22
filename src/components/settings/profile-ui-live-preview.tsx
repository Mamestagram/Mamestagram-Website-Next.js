"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import { getProfileUiPreviewMessage, PROFILE_UI_PREVIEW_CHANNEL, type ProfileUiPreviewDraft } from "@/lib/profile-ui-live-preview";
import styles from "@s/settings.module.css";

export default function ProfileUiLivePreview({ profileId, draft, onClose }: Readonly<{
	profileId: number;
	draft: ProfileUiPreviewDraft;
	onClose: () => void;
}>) {
	const frameRef = useRef<HTMLIFrameElement>(null);
	const backButtonRef = useRef<HTMLButtonElement>(null);
	const loadingTimerRef = useRef<number | undefined>(undefined);
	const [ready, setReady] = useState(false);
	const [failed, setFailed] = useState(false);
	const [attempt, setAttempt] = useState(0);
	const watchLoad = useCallback(() => {
		window.clearTimeout(loadingTimerRef.current);
		loadingTimerRef.current = window.setTimeout(() => setFailed(true), 20000);
	}, []);
	const sendDraft = useCallback(() => {
		frameRef.current?.contentWindow?.postMessage({
			channel: PROFILE_UI_PREVIEW_CHANNEL, type: "apply", profileId, draft,
		}, window.location.origin);
	}, [draft, profileId]);

	useEffect(() => {
		backButtonRef.current?.focus();
		watchLoad();
		const receiveMessage = (event: MessageEvent<unknown>) => {
			if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
			const message = getProfileUiPreviewMessage(event.data, profileId);
			if (message?.type === "ready") sendDraft();
			if (message?.type === "applied") {
				window.clearTimeout(loadingTimerRef.current);
				setReady(true);
				setFailed(false);
			}
			if (message?.type === "close") onClose();
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.stopPropagation();
				onClose();
			}
		};
		window.addEventListener("message", receiveMessage);
		window.addEventListener("keydown", closeOnEscape);
		return () => {
			window.clearTimeout(loadingTimerRef.current);
			window.removeEventListener("message", receiveMessage);
			window.removeEventListener("keydown", closeOnEscape);
		};
	}, [attempt, onClose, profileId, sendDraft, watchLoad]);

	return createPortal(
		<section className={styles.profile_ui_live_preview} data-theme-independent="true" role="dialog" aria-modal="true" aria-label="Profile preview">
			<button ref={backButtonRef} type="button" className={styles.profile_ui_live_preview_close} aria-label="Back to editor" title="Back to editor" onClick={onClose}>
				<FontAwesome prefix="fas" name="xmark"/>
			</button>
			<div className={styles.profile_ui_live_preview_body} aria-busy={!ready && !failed}>
				<iframe key={attempt} ref={frameRef} src={`/profile/${profileId}?uiPreview=1`} title="Profile preview" onLoad={() => { setReady(false); setFailed(false); watchLoad(); sendDraft(); }} onError={() => { setReady(false); setFailed(true); }}/>
				{!ready && <div className={styles.profile_ui_live_preview_loading} role="status">
					{failed ? <>
						<p>The profile preview could not be loaded.</p>
						<button type="button" className={styles.secondary_button} onClick={() => { setReady(false); setFailed(false); setAttempt((current) => current + 1); }}>Retry</button>
					</> : <><FontAwesome prefix="fas" name="spinner" className={styles.spinner}/><p>Loading profile…</p></>}
				</div>}
			</div>
		</section>,
		document.body,
	);
}
