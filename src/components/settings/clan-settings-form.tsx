"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import FontAwesome from "@/components/font-awesome";
import { readMutationResponse } from "@/lib/mutation-response";
import styles from "@s/settings.module.css";

export default function ClanSettingsForm({ tag: initialTag, showPastTags: initialShowPastTags }: Readonly<{
	tag: string,
	showPastTags: boolean
}>) {
	const router = useRouter();
	const [tag, setTag] = useState(initialTag);
	const [showPastTags, setShowPastTags] = useState(initialShowPastTags);
	const [savedTag, setSavedTag] = useState(initialTag);
	const [savedShowPastTags, setSavedShowPastTags] = useState(initialShowPastTags);
	const [status, setStatus] = useState<{ success: boolean, message: string } | null>(null);
	const [isPending, startTransition] = useTransition();
	const normalizedTag = tag.trim();
	const hasChanges = normalizedTag !== savedTag || showPastTags !== savedShowPastTags;

	const submit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus(null);
		startTransition(async () => {
			try {
				const response = await fetch("/api/settings/clan", {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ tag: normalizedTag, showPastTags })
				});
				const result = await readMutationResponse(response);
				setStatus(result);
				if (!result.success) return;

				setTag(normalizedTag);
				setSavedTag(normalizedTag);
				setSavedShowPastTags(showPastTags);
				router.refresh();
			}
			catch {
				setStatus({ success: false, message: "Clan settings could not be updated." });
			}
		});
	};

	return (
		<form className={styles.profile_form} onSubmit={submit}>
			<div className={styles.field}>
				<div className={styles.label_row}>
					<label htmlFor="settings-clan-tag">Clan tag</label>
					<span>{Array.from(normalizedTag).length} / 6</span>
				</div>
				<div className={styles.input_shell}>
					<FontAwesome prefix="fad" name="people-group"/>
					<input id="settings-clan-tag"
					       type="text"
					       value={tag}
					       minLength={1}
					       maxLength={6}
					       autoComplete="off"
					       disabled={isPending}
					       onChange={(event) => {
						       setTag(event.target.value);
						       setStatus(null);
					       }}
					       required/>
				</div>
				<small>Use 1–6 characters without spaces.</small>
			</div>

			<label className={styles.toggle_row}>
				<span className={styles.toggle_copy}>
					<span className={styles.toggle_icon}><FontAwesome prefix="fad" name="clock-rotate-left"/></span>
					<span>
						<strong>Display past tags publicly</strong>
						<small>Show previous clan tags beneath the current tag on the clan profile.</small>
					</span>
				</span>
				<input type="checkbox"
				       checked={showPastTags}
				       disabled={isPending}
				       onChange={(event) => {
					       setShowPastTags(event.target.checked);
					       setStatus(null);
				       }}/>
				<span className={styles.toggle} aria-hidden="true"><span/></span>
			</label>

			<div className={styles.form_footer}>
				<span className={styles.status} data-success={status?.success} role="status">
					{status?.message}
				</span>
				<div className={styles.form_actions}>
					<button type="button"
					        className={styles.secondary_button}
					        disabled={isPending || !hasChanges}
					        onClick={() => {
						        setTag(savedTag);
						        setShowPastTags(savedShowPastTags);
						        setStatus(null);
					        }}>
						Reset
					</button>
					<button type="submit" className={styles.primary_button} disabled={isPending || !hasChanges}>
						<FontAwesome className={isPending ? styles.spinner : undefined}
						             prefix="fas"
						             name={isPending ? "spinner" : "check"}/>
						{isPending ? "Saving…" : "Save changes"}
					</button>
				</div>
			</div>
		</form>
	);
}
