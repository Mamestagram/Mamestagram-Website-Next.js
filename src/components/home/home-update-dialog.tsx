"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import Markdown from "@/components/markdown";
import MarkdownInput from "@/components/markdown-input";
import { HOME_UPDATE_CONTENTS_MAX_BYTES, HOME_UPDATE_TITLE_MAX_LENGTH, HOME_UPDATE_VERSION_MAX_LENGTH, type HomeUpdateInput } from "@/lib/home-updates";
import type { MutationResponse } from "@/lib/mutation-response";
import styles from "@s/home.module.css";

type HomeUpdateDraft = HomeUpdateInput & { id: number | null };

const subscribeToClient = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function HomeUpdateDialog({ value, isPending, canSave, message, onChange, onSave, onClose }: Readonly<{
	value: HomeUpdateDraft;
	isPending: boolean;
	canSave: boolean;
	message: MutationResponse | null;
	onChange: (value: HomeUpdateDraft) => void;
	onSave: () => void;
	onClose: () => void;
}>) {
	const isClient = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);
	const titleId = useId();
	const contentsTooLong = new TextEncoder().encode(value.contents).length > HOME_UPDATE_CONTENTS_MAX_BYTES;
	const title = value.id === null ? "Add update" : "Edit update";

	useEffect(() => {
		if (!isClient) return;
		const dialog = dialogRef.current;
		if (!dialog) return;
		const previousFocus = document.activeElement;
		const previousOverflow = document.body.style.overflow;
		dialog.showModal();
		document.body.style.overflow = "hidden";
		titleRef.current?.focus({ preventScroll: true });
		return () => {
			dialog.close();
			document.body.style.overflow = previousOverflow;
			if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
		};
	}, [isClient]);

	if (!isClient) return null;
	return createPortal(<dialog ref={dialogRef} className={styles.updates_dialog} aria-labelledby={titleId}
		onCancel={(event) => { event.preventDefault(); onClose(); }}>
		<div className={styles.updates_form_heading}>
			<h2 id={titleId}>{title}</h2>
			<button type="button" className={`${styles.updates_button} ${styles.updates_form_close}`} disabled={isPending} onClick={onClose} aria-label="Close update form"><FontAwesome prefix="fas" name="xmark"/></button>
		</div>
		<form className={styles.updates_form} onSubmit={(event) => { event.preventDefault(); onSave(); }} aria-label={title} aria-busy={isPending}>
			<label>Category<select disabled={isPending} value={value.category} onChange={(event) => onChange({ ...value, category: event.currentTarget.value === "fix" ? "fix" : "updates" })}><option value="updates">Update</option><option value="fix">Fix</option></select></label>
			<label>Version<input disabled={isPending} value={value.version} maxLength={HOME_UPDATE_VERSION_MAX_LENGTH * 2} required onChange={(event) => onChange({ ...value, version: Array.from(event.currentTarget.value).slice(0, HOME_UPDATE_VERSION_MAX_LENGTH).join("") })}/></label>
			<label>Title<input ref={titleRef} disabled={isPending} value={value.title} maxLength={HOME_UPDATE_TITLE_MAX_LENGTH * 2} required onChange={(event) => onChange({ ...value, title: Array.from(event.currentTarget.value).slice(0, HOME_UPDATE_TITLE_MAX_LENGTH).join("") })}/></label>
			<label>Contents<MarkdownInput disabled={isPending} value={value.contents} maxLength={HOME_UPDATE_CONTENTS_MAX_BYTES} onChange={(contents) => onChange({ ...value, contents })}/></label>
			<div className={styles.updates_preview}>
				<h3>Markdown preview</h3>
				<Markdown className={styles.update_contents} source={value.contents || "No additional details."}/>
			</div>
			{contentsTooLong && <p className={styles.updates_notice} role="alert">Contents are too long.</p>}
			{message && <p className={styles.updates_notice} data-success={message.success} role={message.success ? "status" : "alert"}>{message.message}</p>}
			<div className={styles.updates_controls}>
				<button type="submit" className={styles.updates_button} disabled={isPending || !canSave}>{isPending ? "Saving…" : "Save changes"}</button>
				<button type="button" className={styles.updates_button} disabled={isPending} onClick={onClose}>Cancel</button>
			</div>
		</form>
	</dialog>, document.body);
}
