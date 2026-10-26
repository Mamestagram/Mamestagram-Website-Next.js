import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { isTooltipFocusSuppressed } from "@/lib/tooltip-focus";
import styles from "@s/settings.module.css";

const hints = {
	tools: ["Toolbox", "Add content, toggle snapping, and use Undo / Redo from the toolbox."],
	add: ["Add content", "Click or drag to add. Adjustable width and height start with Auto enabled."],
	content: ["Move & edit content", "Drag between cards or to an edge. Right-click for settings; on touch, use the grips and sliders."],
	drop: ["Insert content", "Drop on the placement preview. Auto widths share space; manual widths stay fixed."],
	width: ["Adjust width", "Drag to change width. Double-click for Auto width."],
	height: ["Adjust height", "Drag to change height. Double-click for Auto height."],
	both: ["Adjust size", "Drag to change width and height. Double-click to make both Auto."],
	settings: ["Content settings", "Adjust size and appearance. Choose Save changes to keep your edits."],
	remove: ["Remove content", "Remove this card. Undo in Tools can restore it before you close the editor."],
	medals: ["Featured achievements", "Click to choose a medal; drag to move or swap. Save changes keeps your selection."],
	auto: ["Auto size", "On: adapt to the layout. Off: keep the current size and adjust manually."],
	"field-width": ["Content width", "Set a width or enable Auto to share available space. Minimum width is preserved."],
	"field-height": ["Content height", "Set a height in pixels, or enable Auto to fit the layout where supported."],
	radius: ["Rounded corners", "Adjust how rounded this card's corners are."],
	opacity: ["Background opacity", "Lower values show more of your profile background through the card."],
	color: ["Content accent color", "Set this card's accent color. Default restores the profile color."],
	theme: ["Content theme", "Choose Glass or Legacy for this card, or follow the profile theme."],
	snap: ["Snap to nearby content", "Align sizes with nearby cards. Turn off to resize freely."],
	undo: ["Undo", "Undo your last edit: ⌘Z / Ctrl+Z."],
	redo: ["Redo", "Redo an edit: ⌘⇧Z / Ctrl+Shift+Z or Ctrl+Y."],
	reset: ["Reset content settings", "Reset size and appearance. Keep the content list and order."],
	restore: ["Restore default layout", "Restore the standard layout; keep selected medals. Save changes to apply."],
	preview: ["Preview profile", "Check how your unsaved layout looks on the profile page."],
	save: ["Save changes", "Save your layout and medals. Available when you have unsaved edits."],
	language: ["Guide language", "Choose English or Japanese. Your choice is remembered in this browser."],
} satisfies Record<string, readonly [string, string]>;

type GuideKey = keyof typeof hints;
export type ProfileUiGuideLanguage = "en" | "ja";

const japaneseHints = {
	tools: ["ツールボックス", "追加、スナップ、元に戻す・やり直すなどの操作パネルを開閉します。"],
	add: ["コンテンツを追加", "クリックかドラッグで追加。調整可能な幅・高さは自動調整で設定されます。"],
	content: ["コンテンツの移動・設定", "ドラッグで間や端へ移動。右クリック（タッチはスライダー）で設定。"],
	drop: ["コンテンツを挿入", "プレビューの位置にドロップ。幅が自動調整の場合は分け合い、指定幅は維持します。"],
	width: ["横幅を調整", "ドラッグで横幅を変更。ダブルクリックで幅が自動調整に設定されます。"],
	height: ["高さを調整", "ドラッグで高さを変更。ダブルクリックで高さが自動調整に設定されます。"],
	both: ["幅と高さを調整", "ドラッグで幅・高さを変更。ダブルクリックで両方が自動調整に設定されます。"],
	settings: ["コンテンツの設定", "サイズや見た目を調整。Save changesで変更を保存します。"],
	remove: ["コンテンツを削除", "このカードを削除。エディタを閉じる前ならツールボックスのUndoで戻せます。"],
	medals: ["注目のアチーブメント", "クリックで選択、ドラッグで移動・交換します。"],
	auto: ["サイズの自動調整", "オンでレイアウトに合わせて調整。オフで現在のサイズを引き継ぎます。"],
	"field-width": ["コンテンツの横幅", "横幅を指定、またはAutoで空き幅に合わせます。最小幅は維持されます。"],
	"field-height": ["コンテンツの高さ", "高さをpxで指定、またはAutoで調整。対応するカードのみ設定できます。"],
	radius: ["角丸", "カードの角を丸くする度合いを調整します。"],
	opacity: ["背景の不透明度", "値を下げるほど、カードの後ろのプロフィール背景が透けて見えます。"],
	color: ["コンテンツのアクセントカラー", "カードの配色を変更。Defaultでプロフィールの配色に戻します。"],
	theme: ["コンテンツのテーマ", "カードごとにGlass・Legacyを選択。Use profile themeで全体に合わせます。"],
	snap: ["近くのコンテンツに揃える", "近くのカードとサイズを揃えます。自由に調整したい場合はオフに。"],
	undo: ["元に戻す", "直前の編集を戻します。ショートカットは⌘Z / Ctrl+Z。"],
	redo: ["やり直す", "編集をやり直します。⌘⇧Z / Ctrl+Shift+Z、またはCtrl+Y。"],
	reset: ["コンテンツの設定をリセット", "サイズや見た目を初期値に戻します。種類・個数・順番は維持します。"],
	restore: ["標準の配置に戻す", "標準配置に戻し、メダルは維持。Save changesで反映します。"],
	preview: ["プロフィールをプレビュー", "保存前のレイアウトがプロフィールでどう見えるか確認できます。"],
	save: ["変更を保存", "配置とメダルを保存。未保存の変更があるときに押せます。"],
	language: ["ガイドの言語", "英語・日本語を切り替えます。選択した言語はブラウザーに記憶します。"],
} satisfies Record<GuideKey, readonly [string, string]>;

type GuideTarget = { element: HTMLElement; key: GuideKey };
type Point = { x: number; y: number };
const isGuideKey = (key: string | undefined): key is GuideKey => key !== undefined && Object.hasOwn(hints, key);

export default function ProfileUiGuide({ editorRef, language }: Readonly<{
	editorRef: RefObject<HTMLDivElement | null>;
	language: ProfileUiGuideLanguage;
}>) {
	const [target, setTarget] = useState<GuideTarget | null>(null);
	const targetRef = useRef<GuideTarget | null>(null);
	const bubbleRef = useRef<HTMLDivElement>(null);
	const pointRef = useRef<Point | null>(null);
	const frameRef = useRef<number | null>(null);
	const lockedRef = useRef(false);
	const hide = useCallback(() => {
		targetRef.current = null;
		lockedRef.current = false;
		setTarget(null);
	}, []);
	const position = useCallback(() => {
		const current = targetRef.current;
		const bubble = bubbleRef.current;
		if (!current || !bubble) return;
		const element = current.element;
		if (!element.isConnected || element.closest("[hidden], [inert], [aria-hidden='true']")) return hide();
		const rect = element.getBoundingClientRect();
		const viewport = window.visualViewport;
		const leftEdge = viewport?.offsetLeft ?? 0;
		const topEdge = viewport?.offsetTop ?? 0;
		const width = viewport?.width ?? window.innerWidth;
		const height = viewport?.height ?? window.innerHeight;
		if (rect.bottom <= topEdge || rect.top >= topEdge + height || rect.right <= leftEdge || rect.left >= leftEdge + width) return hide();
		const point = pointRef.current;
		const followPointer = point && ["content", "drop", "width", "height", "both"].includes(current.key);
		const x = followPointer ? point.x : (Math.max(rect.left, leftEdge) + Math.min(rect.right, leftEdge + width)) / 2;
		const below = followPointer ? point.y + 22 : rect.bottom + 12;
		const above = followPointer ? point.y - 18 : rect.top - 12;
		bubble.style.maxWidth = `${Math.max(0, Math.min(300, width - 16))}px`;
		bubble.style.maxHeight = `${Math.max(0, height - 16)}px`;
		const size = bubble.getBoundingClientRect();
		const side = below + size.height <= topEdge + height - 8 ? "below" : "above";
		const left = Math.max(leftEdge + 8, Math.min(x - size.width / 2, leftEdge + width - size.width - 8));
		bubble.style.left = `${left}px`;
		bubble.style.top = `${Math.max(topEdge + 8, Math.min(side === "below" ? below : above - size.height, topEdge + height - size.height - 8))}px`;
		bubble.style.setProperty("--profile-ui-guide-arrow", `${Math.max(14, Math.min(x - left, size.width - 14))}px`);
		bubble.dataset.side = side;
		bubble.dataset.positioned = "true";
	}, [hide]);
	const schedulePosition = useCallback(() => {
		if (frameRef.current !== null) return;
		frameRef.current = requestAnimationFrame(() => { frameRef.current = null; position(); });
	}, [position]);

	useEffect(() => {
		const show = (eventTarget: EventTarget | null, point: Point | null, dropping = false) => {
			if (!(eventTarget instanceof Element)) return hide();
			const inEditor = editorRef.current?.contains(eventTarget) || eventTarget.closest("[data-profile-ui-guide-scope]");
			if (!inEditor) return hide();
			const medal = eventTarget.closest<HTMLElement>("[data-content='custom_achievements'] button[aria-haspopup='dialog']");
			const element = medal ?? eventTarget.closest<HTMLElement>("[data-profile-ui-guide]");
			const key = dropping ? "drop" : medal ? "medals" : element?.dataset.profileUiGuide;
			if (!element || !isGuideKey(key)) return hide();
			pointRef.current = point;
			if (targetRef.current?.element !== element || targetRef.current.key !== key) {
				const next = { element, key };
				targetRef.current = next;
				setTarget(next);
			}
			schedulePosition();
		};
		const over = (event: PointerEvent) => { if (!lockedRef.current) show(event.target, { x: event.clientX, y: event.clientY }); };
		const out = (event: PointerEvent) => { if (!lockedRef.current) show(event.relatedTarget, null); };
		const focus = (event: FocusEvent) => { if (isTooltipFocusSuppressed(event.target)) hide(); else show(event.target, null); };
		const blur = (event: FocusEvent) => show(event.relatedTarget, null);
		const down = (event: PointerEvent) => {
			show(event.target, { x: event.clientX, y: event.clientY });
			lockedRef.current = event.target instanceof Element && !!event.target.closest("[data-profile-ui-resize]");
		};
		const move = (event: PointerEvent) => {
			if (!targetRef.current) return;
			pointRef.current = { x: event.clientX, y: event.clientY };
			schedulePosition();
		};
		const drag = (event: DragEvent) => {
			if (!(event.target instanceof Element) || !event.target.closest("[data-profile-ui-preview]")) return hide();
			lockedRef.current = true;
			show(event.target, { x: event.clientX, y: event.clientY }, true);
		};
		const escape = (event: KeyboardEvent) => { if (event.key === "Escape") hide(); };
		document.addEventListener("pointerover", over);
		document.addEventListener("pointerout", out);
		document.addEventListener("pointerdown", down, true);
		document.addEventListener("pointermove", move, { passive: true });
		document.addEventListener("pointerup", hide);
		document.addEventListener("pointercancel", hide);
		document.addEventListener("focusin", focus);
		document.addEventListener("focusout", blur);
		document.addEventListener("dragover", drag, true);
		document.addEventListener("dragend", hide);
		document.addEventListener("drop", hide);
		document.addEventListener("keydown", escape);
		window.addEventListener("blur", hide);
		window.addEventListener("scroll", hide, true);
		window.addEventListener("resize", hide);
		window.visualViewport?.addEventListener("resize", hide);
		window.visualViewport?.addEventListener("scroll", hide);
		return () => {
			document.removeEventListener("pointerover", over);
			document.removeEventListener("pointerout", out);
			document.removeEventListener("pointerdown", down, true);
			document.removeEventListener("pointermove", move);
			document.removeEventListener("pointerup", hide);
			document.removeEventListener("pointercancel", hide);
			document.removeEventListener("focusin", focus);
			document.removeEventListener("focusout", blur);
			document.removeEventListener("dragover", drag, true);
			document.removeEventListener("dragend", hide);
			document.removeEventListener("drop", hide);
			document.removeEventListener("keydown", escape);
			window.removeEventListener("blur", hide);
			window.removeEventListener("scroll", hide, true);
			window.removeEventListener("resize", hide);
			window.visualViewport?.removeEventListener("resize", hide);
			window.visualViewport?.removeEventListener("scroll", hide);
			if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
		};
	}, [editorRef, hide, schedulePosition]);

	useLayoutEffect(() => {
		if (!target) return;
		position();
		const element = target.element;
		const descriptions = element.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? [];
		element.setAttribute("aria-describedby", [...new Set([...descriptions, "profile-ui-guide"])].join(" "));
		return () => {
			const remaining = element.getAttribute("aria-describedby")?.split(/\s+/).filter((id) => id && id !== "profile-ui-guide") ?? [];
			if (remaining.length) element.setAttribute("aria-describedby", remaining.join(" "));
			else element.removeAttribute("aria-describedby");
		};
	}, [language, position, target]);

	const descriptions = language === "ja" ? japaneseHints : hints;
	return target && createPortal(<div ref={bubbleRef} id="profile-ui-guide" className={styles.profile_ui_guide} role="tooltip" lang={language}>
		<strong>{descriptions[target.key][0]}</strong><span>{descriptions[target.key][1]}</span>
	</div>, document.body);
}
