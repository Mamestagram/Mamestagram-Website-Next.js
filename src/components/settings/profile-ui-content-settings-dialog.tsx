"use client";

import { useMemo } from "react";
import FontAwesome from "@/components/font-awesome";
import ProfileUiNumberField from "@/components/settings/profile-ui-number-field";
import ProfileUiSettingsDialog from "@/components/settings/profile-ui-settings-dialog";
import type { PopoverAnchor } from "@/lib/popover-position";
import { getProfileUiPreviewHeight, getProfileUiPreviewWidth } from "@/lib/profile-ui-preview-layout";
import {
	getProfileUiContentHeightLimits,
	getProfileUiContentMinHeight,
	hasDefaultProfileUiContentSettings,
	profileUiContentLabels,
	type ProfileUiItem,
} from "@/lib/profile-ui";
import styles from "@s/settings.module.css";
import { getProfileUiMinimumWidths } from "@/lib/profile-ui-width";
import { useProfileUiGridSize } from "@/lib/use-profile-ui-widths";

export default function ProfileUiContentSettingsDialog({
	content,
	contentCount,
	contentIndex,
	disabled,
	position,
	onClose,
	onMove,
	onChange,
	onDelete,
	onReset,
}: Readonly<{
	content: ProfileUiItem;
	contentCount: number;
	contentIndex: number;
	disabled: boolean;
	position: PopoverAnchor;
	onClose: () => void;
	onMove: (offset: -1 | 1) => void;
	onChange: (content: ProfileUiItem) => void;
	onDelete: () => void;
	onReset: () => void;
}>) {
	const heightLimits = getProfileUiContentHeightLimits(content.content);
	const viewportRef = useMemo(() => ({ current: position.scrollContainer ?? null }), [position.scrollContainer]);
	const { width: gridWidth } = useProfileUiGridSize(viewportRef, "[data-profile-ui-grid]");
	const minimumHeight = getProfileUiContentMinHeight(content.content);
	const minimumWidth = getProfileUiMinimumWidths([content], gridWidth)[0] / 100;
	return (
		<ProfileUiSettingsDialog
			title={profileUiContentLabels[content.content]}
			titleId="profile-ui-content-settings-title"
			closeLabel="Close content settings"
			position={position}
			onClose={onClose}
		>
			<article className={styles.profile_ui_content_editor} key={`${content.content}:${contentIndex}`}>
				<div className={styles.profile_ui_content_heading}>
					<strong>{profileUiContentLabels[content.content]}</strong>
					<div className={styles.profile_ui_icon_actions}>
						<button type="button" aria-label="Reset content settings" disabled={disabled || hasDefaultProfileUiContentSettings(content)} onClick={onReset} title="Reset width, height, Auto, radius, opacity and color for this content."><FontAwesome prefix="fas" name="rotate-left"/></button>
						<button type="button" aria-label="Move content up" disabled={contentIndex === 0 || disabled} onClick={() => onMove(-1)}><FontAwesome prefix="fas" name="arrow-up"/></button>
						<button type="button" aria-label="Move content down" disabled={contentIndex === contentCount - 1 || disabled} onClick={() => onMove(1)}><FontAwesome prefix="fas" name="arrow-down"/></button>
						<button type="button" className={styles.profile_ui_delete_button} aria-label="Delete content" disabled={disabled} onClick={onDelete}><FontAwesome prefix="fas" name="trash"/></button>
					</div>
				</div>
				<div className={styles.profile_ui_content_fields}>
					<ProfileUiNumberField label="Width" min={minimumWidth} max={1} step={0.01} value={content.autoWidth ? -1 : Math.max(minimumWidth, content.width)} autoValue={Math.max(minimumWidth, content.width)} disabled={disabled} auto getAutoValue={() => getProfileUiPreviewWidth(position.scrollContainer, contentIndex) ?? content.width} onChange={(width) => onChange({ ...content, autoWidth: width === -1, width: width === -1 ? content.width : width })}/>
					{heightLimits && <ProfileUiNumberField label="Height (px)" min={minimumHeight} max={heightLimits.max} value={content.height === -1 ? -1 : Math.max(content.height, minimumHeight)} disabled={disabled} auto getAutoValue={() => getProfileUiPreviewHeight(position.scrollContainer, contentIndex)} onChange={(height) => onChange({ ...content, height })}/>}
					<ProfileUiNumberField label="Radius" min={0} max={80} value={content.edgeRadius} disabled={disabled} onChange={(edgeRadius) => onChange({ ...content, edgeRadius })}/>
					<ProfileUiNumberField label="Opacity" min={0} max={1} step={0.1} value={content.boxOpacity} disabled={disabled} onChange={(boxOpacity) => onChange({ ...content, boxOpacity })}/>
					<label>Color
						<span className={styles.profile_ui_color_field}>
							<input type="color" value={`#${content.color ?? "24242d"}`} disabled={disabled} onChange={(event) => onChange({ ...content, color: event.currentTarget.value.slice(1) })}/>
							<button type="button" disabled={content.color === null || disabled} onClick={() => onChange({ ...content, color: null })}>Default</button>
						</span>
					</label>
				</div>
			</article>
		</ProfileUiSettingsDialog>
	);
}
