"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { kickClanMember } from "@/actions/profile";
import ConfirmationDialog from "@/components/confirmation-dialog";
import FontAwesome from "@/components/font-awesome";
import type { OsuMode } from "@/lib/mode";
import styles from "@s/profile.module.css";

export default function KickClanMemberButton({ clanId, memberId, memberName, mode }: Readonly<{
	clanId: number,
	memberId: number,
	memberName: string,
	mode: OsuMode
}>) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();

	const confirmKick = () => {
		setError("");
		startTransition(async () => {
			const result = await kickClanMember(clanId, memberId, mode);
			if (!result.success) {
				setError(result.message);
				return;
			}
			setIsOpen(false);
			router.refresh();
		});
	};

	return (
		<>
			<button type="button"
			        className={styles.clan_member_kick}
			        aria-label={`Kick ${memberName}`}
			        title={`Kick ${memberName}`}
			        onClick={() => {
				        setError("");
				        setIsOpen(true);
			        }}>
				<FontAwesome prefix="fas" name="user-minus"/>
			</button>

			<ConfirmationDialog isOpen={isOpen}
			                    title="Kick clan member?"
			                    description={<>Are you sure you want to kick <strong>{memberName}</strong> from the clan?</>}
			                    icon="user-minus"
			                    pendingLabel="Kicking…"
			                    isPending={isPending}
			                    error={error}
			                    onCancel={() => setIsOpen(false)}
			                    onConfirm={confirmKick}/>
		</>
	);
}
