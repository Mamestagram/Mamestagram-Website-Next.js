"use client";

import { useEffect, useRef, useState, type DragEvent, type PointerEvent } from "react";
import FontAwesome from "@/components/font-awesome";
import {
	PROFILE_UI_MAX_CONTENTS,
	profileUiContentLabels,
	profileUiContentValues,
	type ProfileUiContent,
} from "@/lib/profile-ui";
import type { ProfileUiToolboxDrag } from "@/lib/profile-ui-drag";
import { startProfileUiTouchDrag } from "@/lib/profile-ui-touch-drag";
import type { ProfileUiGuideLanguage } from "@/components/settings/profile-ui-guide";
import styles from "@s/settings.module.css";

const contentIcons: Record<ProfileUiContent, string> = {
	info: "user", stats: "chart-simple", me: "align-left", bestpp: "trophy",
	first_place: "flag", most_played: "play", recent_played: "clock-rotate-left", achievements: "medal",
	custom_achievements: "award",
};

export default function ProfileUiToolbox({
	open, contentCount, disabled, canUndo, canRedo, canResetContentSettings, snappingEnabled,
	guideLanguage, onGuideLanguageChange,
	onClose, onAddContent, onUndo, onRedo, onDragStart, onDragEnd, onSnappingChange, onResetContentSettings,
}: Readonly<{
	open: boolean;
	guideLanguage: ProfileUiGuideLanguage;
	onGuideLanguageChange: (language: ProfileUiGuideLanguage) => void;
	contentCount: number;
	snappingEnabled: boolean;
	onSnappingChange: (enabled: boolean) => void;
	disabled: boolean;
	canUndo: boolean;
	canRedo: boolean;
	canResetContentSettings: boolean;
	onResetContentSettings: () => void;
	onClose: () => void;
	onDragStart: (item: ProfileUiToolboxDrag) => void;
	onDragEnd: () => void;
	onAddContent: (content: ProfileUiContent) => void;
	onUndo: () => void;
	onRedo: () => void;
}>) {
	const [collapsed, setCollapsed] = useState(false);
	const touchCleanupRef = useRef<(() => void) | null>(null);
	useEffect(() => () => touchCleanupRef.current?.(), []);
	useEffect(() => { if (disabled || !open) touchCleanupRef.current?.(); }, [disabled, open]);
	const touchGrip = (item: ProfileUiToolboxDrag, label: string, unavailable = false) => <button
		type="button" className={styles.profile_ui_toolbox_touch_grip} data-profile-ui-guide="add" aria-label={label} title={label}
		disabled={disabled || unavailable} draggable={!disabled && !unavailable}
		onDragStart={(event) => startDrag(event, item)} onDragEnd={onDragEnd}
		onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
			if (disabled || unavailable) return;
			touchCleanupRef.current?.();
			touchCleanupRef.current = startProfileUiTouchDrag(event, () => onDragStart(item));
		}}
	><FontAwesome prefix="fas" name="grip-dots"/></button>;
	const startDrag = (event: DragEvent<HTMLButtonElement>, item: ProfileUiToolboxDrag) => {
		if (disabled || contentCount >= PROFILE_UI_MAX_CONTENTS) return event.preventDefault();
		event.dataTransfer.effectAllowed = "copy";
		event.dataTransfer.setData("text/profile-ui-toolbox", JSON.stringify(item));
		onDragStart(item);
	};

	return <aside id="profile-ui-toolbox" className={styles.profile_ui_toolbox} inert={!open} aria-hidden={!open} aria-label="Profile editor toolbox">
		<div className={styles.profile_ui_toolbox_heading}>
			<div className={styles.profile_ui_toolbox_title}>
				<FontAwesome prefix="fas" name="toolbox"/><strong>Toolbox</strong>
			</div>
			<button type="button" className={styles.profile_ui_toolbox_icon} aria-label="Reset all content settings" data-profile-ui-guide="reset" disabled={disabled || !canResetContentSettings} onClick={onResetContentSettings} title="Reset every content's width, height, Auto, radius, opacity and color. Keep the current content list and order."><FontAwesome prefix="fas" name="rotate-left"/></button>
			<button type="button" className={styles.profile_ui_toolbox_icon} aria-label={collapsed ? "Expand toolbox" : "Collapse toolbox"} aria-expanded={!collapsed} aria-controls="profile-ui-toolbox-body" onClick={() => setCollapsed((value) => !value)}>
				<FontAwesome prefix="fas" name={collapsed ? "chevron-down" : "chevron-up"}/>
			</button>
			<button type="button" className={styles.profile_ui_toolbox_icon} aria-label="Hide toolbox" onClick={onClose}><FontAwesome prefix="fas" name="xmark"/></button>
		</div>
		<div id="profile-ui-toolbox-body" className={styles.profile_ui_toolbox_body} hidden={collapsed}>
			<div className={styles.profile_ui_toolbox_section}>
				<div className={styles.profile_ui_toolbox_label}><span>Add content</span><small>{contentCount}/{PROFILE_UI_MAX_CONTENTS}</small></div>
				<div className={styles.profile_ui_toolbox_palette}>
					{profileUiContentValues.map((content) => <div key={content} className={styles.profile_ui_toolbox_item}><button type="button" disabled={disabled || contentCount >= PROFILE_UI_MAX_CONTENTS} draggable={!disabled && contentCount < PROFILE_UI_MAX_CONTENTS} onDragStart={(event) => startDrag(event, { kind: "content", content })} onDragEnd={onDragEnd} title={contentCount >= PROFILE_UI_MAX_CONTENTS ? "The content limit has been reached." : "Drag into the preview, or click to add."} aria-label={`Add ${profileUiContentLabels[content]}`} data-profile-ui-guide="add" onClick={() => onAddContent(content)}>
						<FontAwesome prefix="fas" name={contentIcons[content]}/><span>{profileUiContentLabels[content]}</span>
					</button>{touchGrip({ kind: "content", content }, `Drag ${profileUiContentLabels[content]} into preview`, contentCount >= PROFILE_UI_MAX_CONTENTS)}</div>)}
				</div>
			</div>
			<label className={styles.profile_ui_toolbox_toggle} data-profile-ui-guide="snap">
				<input type="checkbox" checked={snappingEnabled} disabled={disabled} onChange={(event) => onSnappingChange(event.currentTarget.checked)}/>
				<span>Snap to nearby content</span>
			</label>
			<label className={styles.profile_ui_guide_language} data-profile-ui-guide="language">
				<span>Guide language</span>
				<select value={guideLanguage} onChange={(event) => onGuideLanguageChange(event.currentTarget.value === "ja" ? "ja" : "en")}>
					<option value="en">English</option>
					<option value="ja">Japanese</option>
				</select>
			</label>
			<div className={styles.profile_ui_toolbox_actions}>
				<button type="button" disabled={disabled || !canUndo} onClick={onUndo} data-profile-ui-guide="undo" title="Undo (⌘Z / Ctrl+Z)" aria-keyshortcuts="Meta+z Control+z"><FontAwesome prefix="fas" name="arrow-rotate-left"/> Undo</button>
				<button type="button" disabled={disabled || !canRedo} onClick={onRedo} data-profile-ui-guide="redo" title="Redo (⌘⇧Z / Ctrl+Shift+Z / Ctrl+Y)" aria-keyshortcuts="Meta+Shift+z Control+Shift+z Control+y"><FontAwesome prefix="fas" name="arrow-rotate-right"/> Redo</button>
			</div>
		</div>
	</aside>;
}
