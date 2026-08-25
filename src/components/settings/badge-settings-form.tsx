"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import FontAwesome from "@/components/font-awesome";
import type { SettingsBadge } from "@/database/settings";
import { getBadgeImageUrl } from "@/lib/badge";
import styles from "@s/settings.module.css";

type BadgeUpdateResponse = {
	success: boolean,
	message: string
};

const isBadgeUpdateResponse = (value: unknown): value is BadgeUpdateResponse => {
	if (typeof value !== "object" || value === null) return false;
	const response = value as Record<string, unknown>;
	return typeof response.success === "boolean" && typeof response.message === "string";
};

export default function BadgeSettingsForm({ badges, selectedBadge, baseDomain }: Readonly<{
	badges: SettingsBadge[],
	selectedBadge: number,
	baseDomain: string
}>) {
	const router = useRouter();
	const [selection, setSelection] = useState(selectedBadge);
	const [status, setStatus] = useState<BadgeUpdateResponse | null>(null);
	const [isPending, startTransition] = useTransition();
	const selectedBadgeName = badges.find((badge) => badge.id === selection)?.name ?? "No badge selected";
	
	const selectBadge = (badgeId: number) => {
		if (badgeId === selection || isPending) return;
		setStatus(null);
		startTransition(async () => {
			try {
				const response = await fetch("/api/settings/badge", {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ badgeId })
				});
				const body: unknown = await response.json();
				if (!isBadgeUpdateResponse(body)) {
					setStatus({ success: false, message: "The showcase badge could not be updated." });
					return;
				}
				setStatus(body);
				if (!body.success) return;
				setSelection(badgeId);
				router.refresh();
			} catch {
				setStatus({ success: false, message: "The showcase badge could not be updated." });
			}
		});
	};
	
	return (
		<div className={styles.badge_selector}>
			<div className={styles.badge_summary}>
				<span><FontAwesome prefix="fad" name={selection === 0 ? "badge" : "sparkles"}/></span>
				<p>Currently displayed: <strong>{selectedBadgeName}</strong></p>
			</div>
			<div className={styles.badge_grid}>
				<button className={styles.badge_option}
				        type="button"
				        data-rarity="none"
				        data-selected={selection === 0}
				        disabled={isPending}
				        onClick={() => selectBadge(0)}>
					<span className={styles.badge_image}><FontAwesome prefix="fad" name="ban"/></span>
					<span className={styles.badge_copy}>
						<strong>Hide badge</strong>
						<small>None</small>
					</span>
					{selection === 0 &&
						<FontAwesome className={styles.selected_check} prefix="fas" name="circle-check"/>}
				</button>
				{badges.map((badge) => {
					const isSelected = badge.id === selection;
					return (
						<button key={badge.id}
						        className={styles.badge_option}
						        type="button"
						        data-rarity={badge.rarity}
						        data-selected={isSelected}
						        disabled={isPending || !badge.isOwned}
						        onClick={() => selectBadge(badge.id)}>
							<span className={styles.badge_image}>
								<Image src={getBadgeImageUrl(badge.id, baseDomain)}
								       alt={`${badge.name} badge`}
								       fill
								       sizes="48px"
								       crossOrigin="anonymous"
								       draggable={false}/>
							</span>
							<span className={styles.badge_copy}>
								<strong>{badge.name}</strong>
								<small>{badge.isOwned ? badge.rarity : "Locked"}</small>
							</span>
							{isSelected &&
								<FontAwesome className={styles.selected_check} prefix="fas" name="circle-check"/>}
						</button>
					);
				})}
			</div>
			{status && <p className={styles.status} data-success={status.success} role="status">{status.message}</p>}
		</div>
	);
}
