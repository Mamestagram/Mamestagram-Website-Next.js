"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import FontAwesome from "@/components/font-awesome";
import { readMutationResponse } from "@/lib/mutation-response";
import styles from "@s/settings.module.css";

export default function ProfileSettingsForm({ username: initialUsername, showPastNames: initialShowPastNames }: Readonly<{
	username: string,
	showPastNames: boolean
}>) {
	const router = useRouter();
	const [username, setUsername] = useState(initialUsername);
	const [showPastNames, setShowPastNames] = useState(initialShowPastNames);
	const [savedUsername, setSavedUsername] = useState(initialUsername);
	const [savedShowPastNames, setSavedShowPastNames] = useState(initialShowPastNames);
	const [status, setStatus] = useState<{ success: boolean, message: string } | null>(null);
	const [isPending, startTransition] = useTransition();
	const hasChanges = username.trim() !== savedUsername || showPastNames !== savedShowPastNames;

	const submit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus(null);
		startTransition(async () => {
			try {
				const normalizedUsername = username.trim();
				const response = await fetch("/api/settings/profile", {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ username: normalizedUsername, showPastNames })
				});
				const result = await readMutationResponse(response);
				setStatus(result);
				if (!result.success) return;

				setUsername(normalizedUsername);
				setSavedUsername(normalizedUsername);
				setSavedShowPastNames(showPastNames);
				router.refresh();
			}
			catch {
				setStatus({ success: false, message: "Profile settings could not be updated." });
			}
		});
	};

	return (
		<form className={styles.profile_form} onSubmit={submit}>
			<div className={styles.field}>
				<div className={styles.label_row}>
					<label htmlFor="settings-username">Username</label>
					<span>{username.trim().length} / 15</span>
				</div>
				<div className={styles.input_shell}>
					<FontAwesome prefix="fad" name="user"/>
					<input id="settings-username"
					       type="text"
					       value={username}
					       minLength={2}
					       maxLength={15}
					       autoComplete="username"
					       disabled={isPending}
					       onChange={(event) => {
						       setUsername(event.target.value);
						       setStatus(null);
					       }}
					       required/>
				</div>
				<small>Use 2–15 letters, numbers, spaces, underscores, hyphens, or brackets.</small>
			</div>

			<label className={styles.toggle_row}>
				<span className={styles.toggle_copy}>
					<span className={styles.toggle_icon}><FontAwesome prefix="fad" name="clock-rotate-left"/></span>
					<span>
						<strong>Display past names publicly</strong>
						<small>Show your previous usernames beneath your current name on your profile.</small>
					</span>
				</span>
				<input type="checkbox"
				       checked={showPastNames}
				       disabled={isPending}
				       onChange={(event) => {
					       setShowPastNames(event.target.checked);
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
						        setUsername(savedUsername);
						        setShowPastNames(savedShowPastNames);
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
