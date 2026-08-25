"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMainMode } from "@/actions/profile";
import type { OsuMode } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/profile.module.css";

export default function SetMainModeButton({ profileId, mode, isClan }: Readonly<{
	profileId: number,
	mode: OsuMode,
	isClan: boolean
}>) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState("");
	
	const update = () => {
		setError("");
		startTransition(async () => {
			const result = await setMainMode(profileId, mode, isClan);
			if (!result.success) {
				setError(result.message);
				return;
			}
			router.refresh();
		});
	};
	
	return (
		<span className={styles.main_mode_action}>
			<button type="button"
			        className={styles.set_main_mode}
			        disabled={isPending}
			        onClick={update}>
				<FontAwesome prefix="fas" name={isPending ? "spinner" : "star"}/>
				{isPending ? "Setting…" : "Set as main mode"}
			</button>
			{error && <small role="alert">{error}</small>}
		</span>
	);
}
