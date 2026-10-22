import type { SetStateAction } from "react";
import type { ProfileUiItem } from "@/lib/profile-ui";

const HISTORY_LIMIT = 100;
const equal = (left: ProfileUiItem[], right: ProfileUiItem[]) =>
	JSON.stringify(left) === JSON.stringify(right);

export type ProfileUiHistory = {
	past: ProfileUiItem[][];
	present: ProfileUiItem[];
	future: ProfileUiItem[][];
	groupStart: ProfileUiItem[] | null;
};

type HistoryAction =
	| { type: "set"; value: SetStateAction<ProfileUiItem[]> }
	| { type: "reset"; value: ProfileUiItem[] }
	| { type: "begin" | "end" | "undo" | "redo" };

export const createProfileUiHistory = (contents: ProfileUiItem[]): ProfileUiHistory => ({
	past: [], present: contents, future: [], groupStart: null,
});

const appendPast = (past: ProfileUiItem[][], contents: ProfileUiItem[]) =>
	[...past, contents].slice(-HISTORY_LIMIT);

const hasGroupChange = (history: ProfileUiHistory) =>
	history.groupStart !== null && !equal(history.groupStart, history.present);

export const canUndoProfileUi = (history: ProfileUiHistory) =>
	history.past.length > 0 || hasGroupChange(history);

export const canRedoProfileUi = (history: ProfileUiHistory) =>
	history.future.length > 0 && !hasGroupChange(history);

const endGroup = (history: ProfileUiHistory): ProfileUiHistory => {
	if (history.groupStart === null) return history;
	return hasGroupChange(history)
		? { ...history, past: appendPast(history.past, history.groupStart), future: [], groupStart: null }
		: { ...history, groupStart: null };
};

export const profileUiHistoryReducer = (
	history: ProfileUiHistory,
	action: HistoryAction,
): ProfileUiHistory => {
	switch (action.type) {
		case "reset":
			return createProfileUiHistory(action.value);
		case "begin":
			return history.groupStart === null ? { ...history, groupStart: history.present } : history;
		case "end":
			return endGroup(history);
		case "set": {
			const next = typeof action.value === "function" ? action.value(history.present) : action.value;
			if (equal(next, history.present)) return history;
			return history.groupStart === null
				? { past: appendPast(history.past, history.present), present: next, future: [], groupStart: null }
				: { ...history, present: next };
		}
		case "undo": {
			const current = endGroup(history);
			const previous = current.past.at(-1);
			return previous === undefined ? current : {
				past: current.past.slice(0, -1), present: previous,
				future: [current.present, ...current.future], groupStart: null,
			};
		}
		case "redo": {
			const current = endGroup(history);
			const next = current.future[0];
			return next === undefined ? current : {
				past: appendPast(current.past, current.present), present: next,
				future: current.future.slice(1), groupStart: null,
			};
		}
	}
};

export const getProfileUiHistoryShortcut = (event: Pick<KeyboardEvent,
	"key" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey" | "isComposing" | "defaultPrevented"
>): "undo" | "redo" | null => {
	if (event.defaultPrevented || event.isComposing || event.altKey || (!event.metaKey && !event.ctrlKey)) return null;
	const key = event.key.toLowerCase();
	if (key === "z") return event.shiftKey ? "redo" : "undo";
	return key === "y" && !event.shiftKey ? "redo" : null;
};
