"use client";

import { useId, useState, useTransition } from "react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import FontAwesome from "@/components/font-awesome";
import { readMutationResponse } from "@/lib/mutation-response";
import {
	scoreResetModeLabels,
	scoreResetModes,
	type ScoreResetMode,
} from "@/lib/score-reset";
import styles from "@s/settings.module.css";

export default function ScoreResetSettings({
	canResetScores,
}: Readonly<{
	canResetScores: boolean;
}>) {
	const selectId = useId();
	const [mode, setMode] = useState<ScoreResetMode>("std");
	const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
	const [status, setStatus] = useState<{
		success: boolean;
		message: string;
	} | null>(null);
	const [dialogError, setDialogError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const modeLabel = scoreResetModeLabels[mode];

	const resetScores = () => {
		if (!canResetScores) return;
		setDialogError(null);
		setStatus(null);
		startTransition(async () => {
			try {
				const response = await fetch(
					`/api/settings/score-reset?mode=${encodeURIComponent(mode)}`,
					{ method: "DELETE" },
				);
				const result = await readMutationResponse(response);
				if (!result.success) {
					setDialogError(result.message);
					return;
				}

				setIsConfirmationOpen(false);
				setStatus(result);
			} catch {
				setDialogError("The selected scores could not be reset.");
			}
		});
	};

	return (
		<>
			<section
				className={styles.score_reset_settings}
				data-disabled={!canResetScores}
			>
				<div className={styles.score_reset_heading}>
					<span className={styles.score_reset_icon}>
						<FontAwesome prefix="fad" name="trash-can"/>
					</span>
					<div>
						<h3>Delete scores</h3>
						<p>
							Hide every score for one mode and rebuild your player statistics.
						</p>
					</div>
				</div>

				<div className={styles.score_reset_controls}>
					<label htmlFor={selectId}>Score mode</label>
					<div className={styles.score_reset_action}>
						<div className={styles.score_reset_select}>
							<FontAwesome prefix="fad" name="gamepad-modern"/>
							<select
								id={selectId}
								value={mode}
								disabled={isPending || !canResetScores}
								onChange={(event) => {
									setMode(event.currentTarget.value as ScoreResetMode);
									setStatus(null);
								}}
							>
								{scoreResetModes.map((value) => (
									<option key={value} value={value}>
										{scoreResetModeLabels[value]}
									</option>
								))}
							</select>
							<FontAwesome prefix="fas" name="chevron-down"/>
						</div>
						<button
							type="button"
							className={styles.danger_button}
							disabled={isPending || !canResetScores}
							onClick={() => {
								setDialogError(null);
								setIsConfirmationOpen(true);
							}}
						>
							<FontAwesome prefix="fas" name="trash-can"/>
							Delete scores
						</button>
					</div>
				</div>

				<span
					className={styles.status}
					data-success={status?.success}
					role="status"
				>
					{status?.message}
				</span>
				<small className={styles.score_reset_note}>
						{canResetScores
							? "A fresh sign-in is required before the first reset."
							: "Available to Supporters and Nominator or higher roles."}
				</small>
			</section>

			<ConfirmationDialog
				isOpen={isConfirmationOpen}
				title={`Delete ${modeLabel} scores?`}
				description={`All ${modeLabel} scores will be hidden and your PP, accuracy, ranks, and related statistics will be rebuilt. This cannot be undone from the website.`}
				icon="trash-can"
				confirmLabel="Delete scores"
				pendingLabel="Deleting…"
				isPending={isPending}
				error={dialogError}
				onCancel={() => {
					if (!isPending) setIsConfirmationOpen(false);
				}}
				onConfirm={resetScores}
			/>
		</>
	);
}
