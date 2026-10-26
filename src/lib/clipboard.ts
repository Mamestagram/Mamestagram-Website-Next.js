type LegacyCopyDocument = {
	execCommand: (command: "copy") => boolean;
};

const copyWithSelection = (text: string): boolean => {
	const textarea = document.createElement("textarea");
	const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
	textarea.value = text;
	textarea.readOnly = true;
	textarea.style.position = "fixed";
	textarea.style.inset = "0 auto auto -9999px";
	document.body.append(textarea);
	textarea.select();
	textarea.setSelectionRange(0, text.length);
	try {
		return (document as unknown as LegacyCopyDocument).execCommand("copy");
	} catch {
		return false;
	} finally {
		textarea.remove();
		previousFocus?.focus();
	}
};

export const copyText = async (text: string): Promise<boolean> => {
	if (typeof navigator.clipboard?.writeText !== "function") return copyWithSelection(text);
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return copyWithSelection(text);
	}
};
