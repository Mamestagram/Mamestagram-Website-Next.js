"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, useTransition, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import ConfirmationDialog from "@/components/confirmation-dialog";
import ProfileUiContentSettingsDialog from "@/components/settings/profile-ui-content-settings-dialog";
import ProfileUiPreview from "@/components/settings/profile-ui-preview";
import ProfileUiLivePreview from "@/components/settings/profile-ui-live-preview";
import ProfileUiToolbox from "@/components/settings/profile-ui-toolbox";
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
import styles from "@s/settings.module.css";

const subscribeToClient = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

type EditingTarget = { contentIndex: number; position: PopoverAnchor };

export default function ProfileUiSettings({
	profileId,
	initialContents,
	isSupporter,
	bannerUrl,
	backgroundUrl,
	profileTheme,
	profileHue,
}: Readonly<{
	profileId: number;
	initialContents: ProfileUiItem[];
	isSupporter: boolean;
	bannerUrl: string;
	backgroundUrl: string;
	profileTheme: WebTheme;
	profileHue: number | null;
}>) {
	const [history, dispatchHistory] = useReducer(profileUiHistoryReducer, initialContents,
		(contents) => createProfileUiHistory(normalizeProfileUi(contents)));
	const contents = history.present;
	const setContents = useCallback((value: SetStateAction<ProfileUiItem[]>) => {
		dispatchHistory({ type: "set", value });
	}, []);
	const beginHistoryGroup = useCallback(() => dispatchHistory({ type: "begin" }), []);
	const endHistoryGroup = useCallback(() => dispatchHistory({ type: "end" }), []);
	const pointerHistoryGroup = useRef<number | null>(null);
	const canUndo = canUndoProfileUi(history);
	const canRedo = canRedoProfileUi(history);
	const [savedContents, setSavedContents] = useState(() =>
		normalizeProfileUi(initialContents),
	);
	const savedContentsRef = useRef(savedContents);
	const saveInFlightRef = useRef(false);
	const [status, setStatus] = useState<{
		success: boolean;
		message: string;
	} | null>(null);
	const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(null);
	const editingContentIndex = editingTarget?.contentIndex ?? null;
	const [isEditorOpen, setIsEditorOpen] = useState(false);
	const [isToolboxOpen, setIsToolboxOpen] = useState(true);
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
	}, [endHistoryGroup]);
	const stepHistory = useCallback((direction: "undo" | "redo") => {
		if (!(direction === "undo" ? canUndo : canRedo)) return;
		dispatchHistory({ type: direction });
		setEditingTarget(null);
		setStatus(null);
	}, [canRedo, canUndo]);
	const isMounted = useSyncExternalStore(
		subscribeToClient,
		getClientSnapshot,
		getServerSnapshot,
	);
	const hasChanges = useMemo(
		() => !areProfileUiContentsEqual(contents, savedContents),
		[contents, savedContents],
	);
	const discardAndCloseEditor = useCallback(() => {
		dispatchHistory({ type: "reset", value: normalizeProfileUi(savedContents) });
		pointerHistoryGroup.current = null;
		setToolboxDrag(null);
		setStatus(null);
		setEditingTarget(null);
		setIsDiscardConfirmOpen(false);
		setLivePreviewDraft(null);
		setIsEditorOpen(false);
	}, [savedContents]);
	const closeEditor = useCallback(() => {
		if (isPending) return;
		closeSettings();
		if (hasChanges) {
			setIsDiscardConfirmOpen(true);
			return;
		}
		discardAndCloseEditor();
	}, [closeSettings, discardAndCloseEditor, hasChanges, isPending]);

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
		if (!isEditorOpen || !isSupporter || isPending || isDiscardConfirmOpen || livePreviewDraft !== null) return;
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
	}, [isDiscardConfirmOpen, isEditorOpen, isPending, isSupporter, livePreviewDraft, stepHistory]);

	useEffect(() => {
		if (!isEditorOpen || isDiscardConfirmOpen || livePreviewDraft !== null) return;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
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
		if (!hasChanges || isPending || saveInFlightRef.current || areProfileUiContentsEqual(submittedContents, savedContentsRef.current)) return;
		saveInFlightRef.current = true;
		setStatus(null);
		startTransition(async () => {
			try {
				const response = await fetch("/api/settings/profile-ui", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ contents: submittedContents }),
				});
				const result = await readMutationResponse(response);
				setStatus(result);
				if (result.success) {
					savedContentsRef.current = submittedContents;
					setSavedContents(submittedContents);
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
						{isSupporter
							? "Open the full-screen editor to arrange and resize your profile contents."
							: "Profile layout customization is available to supporters."}
					</small>
					<small className={styles.profile_ui_recommendation}>PC or tablet recommended</small>
				</span>
				<button
					type="button"
					className={styles.secondary_button}
					disabled={!isSupporter}
					onClick={() => { setIsToolboxOpen(true); setIsEditorOpen(true); }}
				>
					<FontAwesome
						prefix="fas"
						name={isSupporter ? "expand" : "lock"}
					/>
					{isSupporter ? "Open editor" : "Supporter only"}
				</button>
			</div>

			{isMounted && isEditorOpen && isSupporter && createPortal(
				<div
					ref={editorRef}
					className={styles.profile_ui_fullscreen}
					data-toolbox-open={isToolboxOpen}
					data-theme-independent="true"
					role="dialog"
					aria-modal="true"
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
							<button type="button" className={styles.secondary_button} aria-expanded={isToolboxOpen} aria-controls="profile-ui-toolbox" onClick={() => setIsToolboxOpen((open) => !open)}>
								<FontAwesome prefix="fas" name="toolbox"/> Tools
							</button>
							<button ref={previewButtonRef} type="button" className={styles.secondary_button} disabled={isPending} onClick={() => {
								closeSettings();
								const draft = parseProfileUiPreviewDraft({ contents, theme: profileTheme, hue: profileHue });
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
							>
								<FontAwesome prefix="fas" name="rotate-left"/> Restore default
							</button>
							<button
								type="button"
								className={styles.primary_button}
								disabled={!hasChanges || isPending}
								onClick={save}
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

					<div className={styles.profile_ui_toolbox_dock}>
						<ProfileUiToolbox
							open={isToolboxOpen}
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
							toolboxDrag={toolboxDrag}
							onToolboxDragEnd={endToolboxDrag}
							disabled={isPending}
							bannerUrl={bannerUrl}
							backgroundUrl={backgroundUrl}
							profileTheme={profileTheme}
							profileHue={profileHue}
							selectedContentIndex={editingContentIndex}
							snappingEnabled={snappingEnabled}
							onChange={(next) => {
								setToolboxDrag(null);
								setContents(normalizeProfileUi(next));
								setStatus(null);
							}}
							onEditContent={(contentIndex, position) => {
								endHistoryGroup();
								setEditingTarget({ contentIndex, position });
							}}
						/>
					</div>

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
								setContents((current) => updateProfileUiContent(current, editingTarget.contentIndex, content, history.groupStart ?? current,
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
				description="All unsaved profile layout changes will be discarded."
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
