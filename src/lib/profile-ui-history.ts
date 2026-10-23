import type { SetStateAction } from "react";
import type { ProfileUiItem } from "@/lib/profile-ui";

const HISTORY_LIMIT = 100;
const equal = (left: unknown, right: unknown) =>
	JSON.stringify(left) === JSON.stringify(right);

export type ProfileUiHistory<T = ProfileUiItem[]> = {
	past: T[];
	present: T;
	future: T[];
	groupStart: T | null;
};

type HistoryAction<T> =
	| { type: "set"; value: SetStateAction<T> }
	| { type: "reset"; value: T }
	| { type: "begin" | "end" | "undo" | "redo" };

export const createProfileUiHistory = <T,>(contents: T): ProfileUiHistory<T> => ({
	past: [], present: contents, future: [], groupStart: null,
});

const appendPast = <T,>(past: T[], contents: T) =>
	[...past, contents].slice(-HISTORY_LIMIT);

const hasGroupChange = <T,>(history: ProfileUiHistory<T>) =>
	history.groupStart !== null && !equal(history.groupStart, history.present);

export const canUndoProfileUi = <T,>(history: ProfileUiHistory<T>) =>
	history.past.length > 0 || hasGroupChange(history);

export const canRedoProfileUi = <T,>(history: ProfileUiHistory<T>) =>
	history.future.length > 0 && !hasGroupChange(history);

const endGroup = <T,>(history: ProfileUiHistory<T>): ProfileUiHistory<T> => {
	if (history.groupStart === null) return history;
	return hasGroupChange(history)
		? { ...history, past: appendPast(history.past, history.groupStart), future: [], groupStart: null }
		: { ...history, groupStart: null };
};

export const profileUiHistoryReducer = <T,>(
	history: ProfileUiHistory<T>,
	action: HistoryAction<T>,
): ProfileUiHistory<T> => {
	switch (action.type) {
		case "reset":
			return createProfileUiHistory(action.value);
		case "begin":
			return history.groupStart === null ? { ...history, groupStart: history.present } : history;
		case "end":
			return endGroup(history);
		case "set": {
			const next = typeof action.value === "function" ? (action.value as (previous: T) => T)(history.present) : action.value;
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
