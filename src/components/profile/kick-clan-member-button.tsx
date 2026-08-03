"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { kickClanMember } from "@/actions/profile";
import type { OsuMode } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/profile.module.css";

export default function KickClanMemberButton({ clanId, memberId, memberName, mode }: Readonly<{
	clanId: number,
	memberId: number,
	memberName: string,
	mode: OsuMode
}>) {
	const router = useRouter();
	const noButtonRef = useRef<HTMLButtonElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		if (!isOpen) return;
		const previousOverflow = document.body.style.overflow;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !isPending) setIsOpen(false);
		};
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", closeOnEscape);
		requestAnimationFrame(() => noButtonRef.current?.focus());
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isOpen, isPending]);

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

			{isOpen && createPortal(
				<div className={styles.clan_kick_overlay}
				     onMouseDown={(event) => {
					     if (event.target === event.currentTarget && !isPending) setIsOpen(false);
				     }}>
					<section className={styles.clan_kick_dialog}
					         role="alertdialog"
					         aria-modal="true"
					         aria-labelledby={`kick-member-${memberId}`}>
						<span className={styles.clan_kick_icon}>
							<FontAwesome prefix="fad" name="user-minus"/>
						</span>
						<h2 id={`kick-member-${memberId}`}>Kick clan member?</h2>
						<p>Are you sure you want to kick <strong>{memberName}</strong> from the clan?</p>
						{error && <small role="alert">{error}</small>}
						<div className={styles.clan_kick_actions}>
							<button ref={noButtonRef}
							        type="button"
							        disabled={isPending}
							        onClick={() => setIsOpen(false)}>
								No
							</button>
							<button type="button"
							        className={styles.confirm_kick}
							        disabled={isPending}
							        onClick={confirmKick}>
								{isPending ? "Kicking…" : "Yes"}
							</button>
						</div>
					</section>
				</div>,
				document.body
			)}
		</>
	);
}
