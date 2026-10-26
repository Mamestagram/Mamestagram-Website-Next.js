"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, useTransition, type MouseEvent, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import ConfirmationDialog from "@/components/confirmation-dialog";
import ProfileUiContentSettingsDialog from "@/components/settings/profile-ui-content-settings-dialog";
import CustomAchievementSelectionDialog from "@/components/profile/custom-achievement-selection-dialog";
import ProfileUiPreview from "@/components/settings/profile-ui-preview";
import ProfileUiLivePreview from "@/components/settings/profile-ui-live-preview";
import ProfileUiToolbox from "@/components/settings/profile-ui-toolbox";
import ProfileUiGuide, { type ProfileUiGuideLanguage } from "@/components/settings/profile-ui-guide";
import { parseProfileUiPreviewDraft, type ProfileUiPreviewDraft } from "@/lib/profile-ui-live-preview";
import { readMutationResponse } from "@/lib/mutation-response";
import {
	canRedoProfileUi,
	canUndoProfileUi,
	createProfileUiHistory,
	getProfileUiHistoryShortcut,
	profileUiHistoryReducer,
} from "@/lib/profile-ui-history";
import {
	getDefaultProfileUi,
	areProfileUiContentsEqual,
	hasDefaultProfileUiContentSettings,
	resetProfileUiContentSettings,
	createProfileUiToolboxContent,
	PROFILE_UI_MAX_CONTENTS,
	normalizeProfileUi,
	type ProfileUiItem,
	type ProfileUiContent,
} from "@/lib/profile-ui";
import { updateProfileUiContent } from "@/lib/profile-ui-reflow";
import { getProfileUiMinimumWidths } from "@/lib/profile-ui-width";
import type { WebTheme } from "@/lib/theme";
import { captureProfileUiDragLayout, type ProfileUiToolboxDragSession } from "@/lib/profile-ui-drag";
import type { PopoverAnchor } from "@/lib/popover-position";
import { focusWithoutTooltip } from "@/lib/tooltip-focus";
import { areCustomAchievementIdsEqual, getSelectedCustomAchievements, moveCustomAchievement, parseCustomAchievementIds, createEmptyCustomAchievementIds, type CustomAchievementIds, type CustomAchievementSettings } from "@/lib/custom-achievements";
import styles from "@s/settings.module.css";

const subscribeToClient = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
const guideStorageKey = "mamestagram:profile-ui:show-guide";
const guideLanguageStorageKey = "mamestagram:profile-ui:guide-language";

const emptyCustomAchievements: CustomAchievementSettings = { achievements: [], selectedIds: createEmptyCustomAchievementIds() };
type ProfileUiEditorDraft = { contents: ProfileUiItem[]; achievementIds: CustomAchievementIds };
const equalDrafts = (left: ProfileUiEditorDraft, right: ProfileUiEditorDraft) =>
	areProfileUiContentsEqual(left.contents, right.contents) && areCustomAchievementIdsEqual(left.achievementIds, right.achievementIds);

type EditingTarget = { contentIndex: number; position: PopoverAnchor };
type EditingMedal = EditingTarget & { slotIndex: number };

export default function ProfileUiSettings({
	profileId,
	initialContents,
	customAchievements = emptyCustomAchievements,
	canUseSupporterFeatures,
	bannerUrl,
	backgroundUrl,
	profileTheme,
	profileHue,
	profileColor = null,
}: Readonly<{
	profileId: number;
	initialContents: ProfileUiItem[];
	customAchievements?: CustomAchievementSettings;
	canUseSupporterFeatures: boolean;
	bannerUrl: string;
	backgroundUrl: string;
	profileTheme: WebTheme;
	profileHue: number | null;
	profileColor?: string | null;
}>) {
	const [history, dispatchHistory] = useReducer(profileUiHistoryReducer<ProfileUiEditorDraft>,
		{ contents: initialContents, achievementIds: customAchievements.selectedIds },
		(draft) => createProfileUiHistory({ ...draft, contents: normalizeProfileUi(draft.contents), achievementIds: parseCustomAchievementIds(draft.achievementIds) ?? createEmptyCustomAchievementIds() }));
	const { contents, achievementIds } = history.present;
	const selectedAchievements = useMemo(() => getSelectedCustomAchievements(customAchievements.achievements, achievementIds),
		[customAchievements.achievements, achievementIds]);
	const setContents = useCallback((value: SetStateAction<ProfileUiItem[]>) => {
		dispatchHistory({ type: "set", value: (draft) => ({ ...draft, contents: typeof value === "function" ? value(draft.contents) : value }) });
	}, []);
	const beginHistoryGroup = useCallback(() => dispatchHistory({ type: "begin" }), []);
	const endHistoryGroup = useCallback(() => dispatchHistory({ type: "end" }), []);
	const pointerHistoryGroup = useRef<number | null>(null);
	const canUndo = canUndoProfileUi(history);
	const canRedo = canRedoProfileUi(history);
	const [savedDraft, setSavedDraft] = useState(history.present);
	const savedDraftRef = useRef(savedDraft);
	const saveInFlightRef = useRef(false);
	const [status, setStatus] = useState<{
		success: boolean;
		message: string;
	} | null>(null);
	const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(null);
	const [editingMedal, setEditingMedal] = useState<EditingMedal | null>(null);
	const editingContentIndex = editingTarget?.contentIndex ?? null;
	const [isEditorOpen, setIsEditorOpen] = useState(false);
	const [isToolboxOpen, setIsToolboxOpen] = useState(true);
	const [isGuideOpen, setIsGuideOpen] = useState(false);
	const [guideLanguage, setGuideLanguage] = useState<ProfileUiGuideLanguage>("en");
	const [snappingEnabled, setSnappingEnabled] = useState(true);
	const [toolboxDrag, setToolboxDrag] = useState<ProfileUiToolboxDragSession | null>(null);
	const endToolboxDrag = useCallback(() => setToolboxDrag(null), []);
	const editorRef = useRef<HTMLDivElement>(null);
	const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
	const [livePreviewDraft, setLivePreviewDraft] = useState<ProfileUiPreviewDraft | null>(null);
	const previewButtonRef = useRef<HTMLButtonElement>(null);
	const closeLivePreview = useCallback(() => {
		setLivePreviewDraft(null);
		requestAnimationFrame(() => previewButtonRef.current?.focus());
	}, []);
	const closeEditorButtonRef = useRef<HTMLButtonElement>(null);
	const [isPending, startTransition] = useTransition();
	const closeSettings = useCallback(() => {
		endHistoryGroup();
		setEditingTarget(null);
		setEditingMedal(null);
	}, [endHistoryGroup]);
	const closeMedalSelection = useCallback(() => {
		setEditingMedal(null);
		if (editingMedal) requestAnimationFrame(() => {
			if (document.activeElement !== document.body) return;
			focusWithoutTooltip(editorRef.current?.querySelectorAll<HTMLButtonElement>(`[data-preview-content="${editingMedal.contentIndex}"] button[aria-haspopup="dialog"]`)[editingMedal.slotIndex]);
		});
	}, [editingMedal]);
	const editMedal = useCallback((contentIndex: number, slotIndex: number, event: MouseEvent<HTMLButtonElement>) => {
		endHistoryGroup();
		setEditingTarget(null);
		const rect = event.currentTarget.getBoundingClientRect();
		setEditingMedal({ contentIndex, slotIndex, position: {
			x: rect.left, y: rect.bottom + 8,
			scrollContainer: event.currentTarget.closest<HTMLElement>("[data-profile-ui-preview]") ?? undefined,
		} });
	}, [endHistoryGroup]);
	const stepHistory = useCallback((direction: "undo" | "redo") => {
		if (!(direction === "undo" ? canUndo : canRedo)) return;
		dispatchHistory({ type: direction });
		setEditingTarget(null);
		setEditingMedal(null);
		setStatus(null);
	}, [canRedo, canUndo]);
	const isMounted = useSyncExternalStore(
		subscribeToClient,
		getClientSnapshot,
		getServerSnapshot,
	);
	const hasChanges = useMemo(
		() => !equalDrafts(history.present, savedDraft),
		[history.present, savedDraft],
	);
	const discardAndCloseEditor = useCallback(() => {
		dispatchHistory({ type: "reset", value: { ...savedDraft, contents: normalizeProfileUi(savedDraft.contents) } });
		pointerHistoryGroup.current = null;
		setToolboxDrag(null);
		setStatus(null);
		setEditingTarget(null);
		setEditingMedal(null);
		setIsDiscardConfirmOpen(false);
		setLivePreviewDraft(null);
		setIsEditorOpen(false);
	}, [savedDraft]);
	const closeEditor = useCallback(() => {
		if (isPending) return;
		closeSettings();
		if (hasChanges) {
			setIsDiscardConfirmOpen(true);
			return;
		}
		discardAndCloseEditor();
	}, [closeSettings, discardAndCloseEditor, hasChanges, isPending]);
	const openEditor = () => {
		let showGuide = false;
		let language: ProfileUiGuideLanguage = window.navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";
		try {
			showGuide = window.localStorage.getItem(guideStorageKey) === "true";
			const savedLanguage = window.localStorage.getItem(guideLanguageStorageKey);
			if (savedLanguage === "en" || savedLanguage === "ja") language = savedLanguage;
		} catch { /* Keep the defaults when storage is unavailable. */ }
		setIsGuideOpen(showGuide);
		setGuideLanguage(language);
		setIsToolboxOpen(true);
		setIsEditorOpen(true);
	};
	const toggleGuide = () => {
		const showGuide = !isGuideOpen;
		setIsGuideOpen(showGuide);
		try { window.localStorage.setItem(guideStorageKey, String(showGuide)); } catch { /* The guide can still be toggled without storage. */ }
	};
	const changeGuideLanguage = (language: ProfileUiGuideLanguage) => {
		setGuideLanguage(language);
		try { window.localStorage.setItem(guideLanguageStorageKey, language); } catch { /* The language can still be changed without storage. */ }
	};

	useLayoutEffect(() => {
		if (!isEditorOpen) return;
		const editor = editorRef.current;
		const header = document.querySelector<HTMLElement>("[data-site-header]");
		if (!editor) return;
		const updateHeaderSpace = () => editor.style.setProperty("--profile-ui-site-header-height", `${Math.max(0, header?.getBoundingClientRect().bottom ?? 0)}px`);
		updateHeaderSpace();
		if (!header) return;
		const observer = new ResizeObserver(updateHeaderSpace);
		observer.observe(header);
		return () => observer.disconnect();
	}, [isEditorOpen]);

	useEffect(() => {
		if (!isEditorOpen) return;
		const root = document.documentElement;
		const body = document.body;
		const previousRootOverflow = root.style.overflow;
		const previousBodyOverflow = body.style.overflow;
		root.style.overflow = "hidden";
		body.style.overflow = "hidden";
		return () => {
			pointerHistoryGroup.current = null;
			endHistoryGroup();
			root.style.overflow = previousRootOverflow;
			body.style.overflow = previousBodyOverflow;
		};
	}, [endHistoryGroup, isEditorOpen]);

	useEffect(() => {
		if (!isEditorOpen) return;
		const finishPointerGroup = (event: PointerEvent) => {
			if (pointerHistoryGroup.current !== event.pointerId) return;
			pointerHistoryGroup.current = null;
			endHistoryGroup();
		};
		window.addEventListener("pointerup", finishPointerGroup);
		window.addEventListener("pointercancel", finishPointerGroup);
		return () => {
			window.removeEventListener("pointerup", finishPointerGroup);
			window.removeEventListener("pointercancel", finishPointerGroup);
		};
	}, [endHistoryGroup, isEditorOpen]);

	useEffect(() => {
		if (!isEditorOpen || !canUseSupporterFeatures || isPending || isDiscardConfirmOpen || livePreviewDraft !== null) return;
		const onHistoryShortcut = (event: KeyboardEvent) => {
			const direction = getProfileUiHistoryShortcut(event);
			if (!direction) return;
			const target = event.target;
			if (target instanceof HTMLElement && (target.isContentEditable || target.closest("textarea, [contenteditable='true']"))) return;
			if (target instanceof HTMLInputElement && ["text", "search", "email", "url", "tel", "password"].includes(target.type)) return;
			event.preventDefault();
			stepHistory(direction);
		};
		window.addEventListener("keydown", onHistoryShortcut);
		return () => window.removeEventListener("keydown", onHistoryShortcut);
	}, [isDiscardConfirmOpen, isEditorOpen, isPending, canUseSupporterFeatures, livePreviewDraft, stepHistory]);

	useEffect(() => {
		if (!isEditorOpen || isDiscardConfirmOpen || livePreviewDraft !== null) return;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || event.defaultPrevented) return;
			if (event.target instanceof Element) {
				if (event.target.closest("[data-site-header]")) return;
				const dialog = event.target.closest("[role='dialog']");
				if (dialog && dialog !== editorRef.current && !dialog.hasAttribute("data-profile-ui-guide-scope")) return;
			}
			if (editingContentIndex !== null) {
				closeSettings();
				return;
			}
			closeEditor();
		};
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, [closeEditor, closeSettings, editingContentIndex, isDiscardConfirmOpen, isEditorOpen, livePreviewDraft]);

	useEffect(() => {
		if (!toolboxDrag) return;
		const finish = () => setToolboxDrag(null);
		window.addEventListener("dragend", finish);
		window.addEventListener("drop", finish);
		window.addEventListener("blur", finish);
		return () => {
			window.removeEventListener("dragend", finish);
			window.removeEventListener("drop", finish);
			window.removeEventListener("blur", finish);
		};
	}, [toolboxDrag]);

	const addContent = (content: ProfileUiContent) => {
		if (isPending || contents.length >= PROFILE_UI_MAX_CONTENTS) return;
		closeSettings();
		setContents((current) => current.length >= PROFILE_UI_MAX_CONTENTS ? current :
			normalizeProfileUi([...current, createProfileUiToolboxContent(content, current.length + 1)]));
		setStatus(null);
	};
	const moveContent = (index: number, offset: -1 | 1) => {
		setContents((current) => {
			const target = index + offset;
			if (target < 0 || target >= current.length) return current;
			const next = [...current];
			[next[index], next[target]] = [next[target], next[index]];
			return normalizeProfileUi(next);
		});
		setStatus(null);
	};

	const save = () => {
		const submittedContents = normalizeProfileUi(contents);
		const submittedDraft = { contents: submittedContents, achievementIds };
		if (!hasChanges || isPending || saveInFlightRef.current || equalDrafts(submittedDraft, savedDraftRef.current)) return;
		saveInFlightRef.current = true;
		setStatus(null);
		startTransition(async () => {
			try {
				const response = await fetch("/api/settings/profile-ui", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(submittedDraft),
				});
				const result = await readMutationResponse(response);
				setStatus(result);
				if (result.success) {
					savedDraftRef.current = submittedDraft;
					setSavedDraft(submittedDraft);
				}
			} catch {
				setStatus({
					success: false,
					message: "Profile UI could not be updated.",
				});
			} finally {
				saveInFlightRef.current = false;
			}
		});
	};

	const restoreDefault = () => {
		endHistoryGroup();
		setContents(normalizeProfileUi(getDefaultProfileUi()));
		setEditingTarget(null);
		setEditingMedal(null);
		setStatus(null);
	};
	const resetContentSettings = (index?: number) => {
		endHistoryGroup();
		setContents((current) => normalizeProfileUi(current.map((content, contentIndex) =>
			index === undefined || index === contentIndex ? resetProfileUiContentSettings(content) : content,
		)));
		setStatus(null);
	};

	return (
		<>
			<div className={styles.profile_ui_launcher}>
				<span className={styles.profile_ui_launcher_icon}>
					<FontAwesome prefix="fad" name="table-columns"/>
				</span>
				<span className={styles.profile_ui_launcher_copy}>
					<strong>Profile layout</strong>
					<small>
						{canUseSupporterFeatures
							? "Open the full-screen editor to arrange and resize your profile contents."
							: "Profile layout customization is available to Supporters and Nominator or higher roles."}
					</small>
					<small className={styles.profile_ui_recommendation}>PC or tablet recommended</small>
				</span>
				<button
					type="button"
					className={styles.secondary_button}
					disabled={!canUseSupporterFeatures}
					onClick={openEditor}
				>
					<FontAwesome
						prefix="fas"
						name={canUseSupporterFeatures ? "expand" : "lock"}
					/>
					{canUseSupporterFeatures ? "Open editor" : "Supporter / Nominator+"}
				</button>
			</div>

			{isMounted && isEditorOpen && canUseSupporterFeatures && createPortal(
				<div
					ref={editorRef}
					className={styles.profile_ui_fullscreen}
					data-toolbox-open={isToolboxOpen}
					data-theme-independent="true"
					role="dialog"
					aria-labelledby="profile-ui-editor-title"
					inert={isDiscardConfirmOpen || livePreviewDraft !== null}
					onFocusCapture={(event) => {
						if (!isPending && event.target instanceof HTMLInputElement && ["number", "range", "color"].includes(event.target.type)) beginHistoryGroup();
					}}
					onBlur={(event) => {
						if (event.target instanceof HTMLInputElement && ["number", "range", "color"].includes(event.target.type)) endHistoryGroup();
					}}
					onPointerDownCapture={(event) => {
						const target = event.target;
						if (isPending || !(target instanceof HTMLElement)) return;
						if (target.matches("input[type='range']") || target.closest("[data-profile-ui-resize]")) {
							pointerHistoryGroup.current = event.pointerId;
							beginHistoryGroup();
						}
					}}
				>
					<div className={styles.profile_ui_fullscreen_heading}>
						<div>
							<span className={styles.profile_ui_launcher_icon}>
								<FontAwesome prefix="fad" name="table-columns"/>
							</span>
							<span>
								<h2 id="profile-ui-editor-title">Profile layout editor</h2>
								<p>Drag to move, resize from the highlighted edges, or right-click a content card for its settings.</p>
								<span className={styles.status} data-success={status?.success ?? undefined} role="status" hidden={!status}>
									{status?.message ?? ""}
								</span>
							</span>
						</div>
						<div className={styles.profile_ui_fullscreen_actions}>
							<button type="button" className={styles.secondary_button} aria-pressed={isGuideOpen} title={isGuideOpen ? "Hide operation guide" : "Show operation guide"} onClick={toggleGuide}>
								<FontAwesome prefix="fas" name="circle-question"/> Guide
							</button>
							<button type="button" className={styles.secondary_button} data-profile-ui-guide="tools" aria-expanded={isToolboxOpen} aria-controls="profile-ui-toolbox" onClick={() => setIsToolboxOpen((open) => !open)}>
								<FontAwesome prefix="fas" name="toolbox"/> Tools
							</button>
							<button ref={previewButtonRef} type="button" className={styles.secondary_button} data-profile-ui-guide="preview" disabled={isPending} onClick={() => {
								closeSettings();
								const draft = parseProfileUiPreviewDraft({ contents, customAchievements: selectedAchievements, theme: profileTheme, hue: profileHue, color: profileColor });
								if (draft) setLivePreviewDraft(draft);
								else setStatus({ success: false, message: "The current layout cannot be previewed. Check its settings." });
							}}>
								<FontAwesome prefix="fas" name="eye"/> Preview
							</button>
							<button
								type="button"
								className={styles.secondary_button}
								disabled={isPending}
								onClick={restoreDefault}
								data-profile-ui-guide="restore"
							>
								<FontAwesome prefix="fas" name="rotate-left"/> Restore default
							</button>
							<button
								type="button"
								className={styles.primary_button}
								disabled={!hasChanges || isPending}
								onClick={save}
								data-profile-ui-guide="save"
							>
								<FontAwesome prefix="fas" name={isPending ? "spinner" : "check"} className={isPending ? styles.spinner : undefined}/>
								Save changes
							</button>
							<button
								type="button"
								className={styles.profile_ui_fullscreen_close}
								aria-label="Close profile layout editor"
								ref={closeEditorButtonRef}
								disabled={isPending}
								onClick={closeEditor}
							>
								<FontAwesome prefix="fas" name="xmark"/>
							</button>
						</div>
					</div>

					{isGuideOpen && !isDiscardConfirmOpen && livePreviewDraft === null && <ProfileUiGuide editorRef={editorRef} language={guideLanguage}/>}

					<div className={styles.profile_ui_toolbox_dock}>
						<ProfileUiToolbox
							open={isToolboxOpen}
							guideLanguage={guideLanguage}
							onGuideLanguageChange={changeGuideLanguage}
							contentCount={contents.length}
							snappingEnabled={snappingEnabled}
							onSnappingChange={setSnappingEnabled}
							disabled={isPending}
							canUndo={canUndo}
							canRedo={canRedo}
							canResetContentSettings={contents.some((content) => !hasDefaultProfileUiContentSettings(content))}
							onResetContentSettings={() => { closeSettings(); resetContentSettings(); }}
							onClose={() => setIsToolboxOpen(false)}
							onAddContent={addContent}
							onDragStart={(item) => {
								const viewport = editorRef.current?.querySelector<HTMLElement>("[data-profile-ui-preview]");
								if (!viewport) return;
								closeSettings();
								setToolboxDrag({ ...item, layout: captureProfileUiDragLayout(viewport) });
							}}
							onDragEnd={endToolboxDrag}
							onUndo={() => stepHistory("undo")}
							onRedo={() => stepHistory("redo")}
						/>
					</div>

					<div className={styles.profile_ui_fullscreen_body}>
						<ProfileUiPreview
							contents={contents}
							customAchievements={selectedAchievements}
							activeAchievementSlot={editingMedal}
							onAchievementSlotClick={editMedal}
							onAchievementReorder={(from, to) => {
								const ids = moveCustomAchievement(achievementIds, from, to);
								if (isPending || areCustomAchievementIdsEqual(ids, achievementIds)) return;
								closeSettings();
								dispatchHistory({ type: "set", value: (draft) => ({ ...draft, achievementIds: ids }) });
								setStatus(null);
							}}
							toolboxDrag={toolboxDrag}
							onToolboxDragEnd={endToolboxDrag}
							disabled={isPending}
							bannerUrl={bannerUrl}
							backgroundUrl={backgroundUrl}
							profileTheme={profileTheme}
							profileHue={profileHue}
						profileColor={profileColor}
							selectedContentIndex={editingContentIndex}
							snappingEnabled={snappingEnabled}
							onChange={(next) => {
								setToolboxDrag(null);
								setContents(normalizeProfileUi(next));
								setStatus(null);
							}}
							onEditContent={(contentIndex, position) => {
								endHistoryGroup();
								setEditingMedal(null);
								setEditingTarget({ contentIndex, position });
							}}
						/>
					</div>

					{editingMedal && contents[editingMedal.contentIndex]?.content === "custom_achievements" && <CustomAchievementSelectionDialog
						achievements={customAchievements.achievements} selectedIds={achievementIds} slotIndex={editingMedal.slotIndex}
						position={editingMedal.position} disabled={isPending} onClose={closeMedalSelection} onChange={(ids) => {
							if (isPending) return;
							endHistoryGroup();
							if (!areCustomAchievementIdsEqual(ids, achievementIds)) dispatchHistory({ type: "set", value: (draft) => ({ ...draft, achievementIds: ids }) });
							setStatus(null);
							closeMedalSelection();
						}}/>}

					{editingTarget && contents[editingTarget.contentIndex] && (
						<ProfileUiContentSettingsDialog
							content={contents[editingTarget.contentIndex]}
							contentIndex={editingTarget.contentIndex}
							contentCount={contents.length}
							position={editingTarget.position}
							disabled={isPending}
							onClose={closeSettings}
							onReset={() => resetContentSettings(editingTarget.contentIndex)}
							onMove={(offset) => {
								moveContent(editingTarget.contentIndex, offset);
								setEditingTarget({ ...editingTarget, contentIndex: editingTarget.contentIndex + offset });
							}}
							onChange={(content) => {
								setContents((current) => updateProfileUiContent(current, editingTarget.contentIndex, content, history.groupStart?.contents ?? current,
									getProfileUiMinimumWidths(current, editingTarget.position.scrollContainer?.querySelector<HTMLElement>("[data-profile-ui-grid]")?.clientWidth ?? 0)));
								setStatus(null);
							}}
							onDelete={() => {
								setContents((current) => normalizeProfileUi(current.filter((_, index) => index !== editingTarget.contentIndex)));
								setEditingTarget(null);
								setStatus(null);
							}}
						/>
					)}
				</div>,
				document.body,
			)}
			{isEditorOpen && livePreviewDraft && <ProfileUiLivePreview profileId={profileId} draft={livePreviewDraft} onClose={closeLivePreview}/>}
			<ConfirmationDialog
				isOpen={isEditorOpen && isDiscardConfirmOpen}
				title="Discard unsaved changes?"
				description="All unsaved profile layout and achievement changes will be discarded."
				icon="triangle-exclamation"
				confirmLabel="Discard changes"
				cancelLabel="Keep editing"
				lockScroll={false}
				overlayClassName={styles.profile_ui_discard_overlay}
				onCancel={() => {
					setIsDiscardConfirmOpen(false);
					requestAnimationFrame(() => closeEditorButtonRef.current?.focus());
				}}
				onConfirm={discardAndCloseEditor}
			/>
		</>
	);
}
