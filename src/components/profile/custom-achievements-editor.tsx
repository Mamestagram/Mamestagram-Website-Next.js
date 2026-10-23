"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CustomAchievementSelectionDialog from "@/components/profile/custom-achievement-selection-dialog";
import CustomAchievementsCard from "@/components/profile/custom-achievements-card";
import { areCustomAchievementIdsEqual, getSelectedCustomAchievements, moveCustomAchievement, parseCustomAchievementIds, createEmptyCustomAchievementIds, type CustomAchievementIds, type CustomAchievementSettings } from "@/lib/custom-achievements";
import { readMutationResponse, type MutationResponse } from "@/lib/mutation-response";
import type { PopoverAnchor } from "@/lib/popover-position";
import { focusWithoutTooltip } from "@/lib/tooltip-focus";
import settingsStyles from "@s/settings.module.css";

type ActiveSlot = { index: number; position: PopoverAnchor };

export default function CustomAchievementsEditor({ settings }: Readonly<{ settings: CustomAchievementSettings }>) {
	const router = useRouter();
	const slotRef = useRef<HTMLButtonElement | null>(null);
	const inFlightRef = useRef(false);
	const [savedIds, setSavedIds] = useState(() => parseCustomAchievementIds(settings.selectedIds) ?? createEmptyCustomAchievementIds());
	const savedIdsRef = useRef(savedIds);
	const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null);
	const [status, setStatus] = useState<MutationResponse | null>(null);
	const [isPending, startTransition] = useTransition();
	const close = useCallback(() => {
		if (inFlightRef.current) return;
		setActiveSlot(null);
		setStatus(null);
		requestAnimationFrame(() => {
			if (document.activeElement === document.body) focusWithoutTooltip(slotRef.current);
		});
	}, []);
	const save = (ids: CustomAchievementIds) => {
		if (inFlightRef.current) return;
		if (areCustomAchievementIdsEqual(ids, savedIdsRef.current)) { close(); return; }
		inFlightRef.current = true;
		setStatus(null);
		startTransition(async () => {
			try {
				const response = await fetch("/api/settings/custom-achievements", {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ achievementIds: ids }),
				});
				const result = await readMutationResponse(response);
				setStatus(result);
				if (!response.ok || !result.success) return;
				savedIdsRef.current = ids;
				setSavedIds(ids);
				setActiveSlot(null);
				requestAnimationFrame(() => {
					if (document.activeElement === document.body) focusWithoutTooltip(slotRef.current);
				});
				router.refresh();
			} catch {
				setStatus({ success: false, message: "Displayed medals could not be updated." });
			} finally {
				inFlightRef.current = false;
			}
		});
	};
	return <>
		<CustomAchievementsCard achievements={getSelectedCustomAchievements(settings.achievements, savedIds)} canRevealSecretConditions
			onReorder={(from, to) => save(moveCustomAchievement(savedIdsRef.current, from, to))}
			activeSlot={activeSlot?.index} disabled={isPending} onSlotClick={(index, event) => {
				if (inFlightRef.current) return;
				slotRef.current = event.currentTarget;
				setStatus(null);
				const rect = event.currentTarget.getBoundingClientRect();
				setActiveSlot({ index, position: { x: rect.left, y: rect.bottom + 8 } });
			}}>
			{status && !activeSlot && <p className={settingsStyles.status} data-success={status.success} role="status">{status.message}</p>}
		</CustomAchievementsCard>
		{activeSlot && <CustomAchievementSelectionDialog achievements={settings.achievements} selectedIds={savedIds}
			slotIndex={activeSlot.index} position={activeSlot.position} disabled={isPending} onClose={close} onChange={save}>
			{isPending && <p className={settingsStyles.status} role="status">Saving…</p>}
			{status && <p className={settingsStyles.status} data-success={status.success} role="status">{status.message}</p>}
		</CustomAchievementSelectionDialog>}
	</>;
}
