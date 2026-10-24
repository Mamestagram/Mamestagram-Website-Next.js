"use client";

import { accentColorProperties, applyAccentColor } from "@/lib/accent-color";

import { useLayoutEffect } from "react";
import { getWebThemeName, type WebTheme } from "@/lib/theme";

const PROFILE_DEFAULT_HUE = 210;

export default function ProfileAppearance({
	theme,
	hue,
	color = null,
}: Readonly<{ theme: WebTheme; hue: number | null; color?: string | null }>) {
	useLayoutEffect(() => {
		const root = document.documentElement;
		const previousTheme = root.getAttribute("data-theme");
		const previousUserHue = root.getAttribute("data-user-hue");
		const previousAccentColor = root.getAttribute("data-accent-color");
		const previousColors = accentColorProperties.map((property) => ({
			property,
			value: root.style.getPropertyValue(property),
			priority: root.style.getPropertyPriority(property),
		}));

		root.dataset.profileAppearance = "true";
		root.dataset.theme = getWebThemeName(theme);
		applyAccentColor(root, color, hue, PROFILE_DEFAULT_HUE);

		return () => {
			delete root.dataset.profileAppearance;
			if (previousTheme === null) delete root.dataset.theme;
			else root.setAttribute("data-theme", previousTheme);
			if (previousAccentColor === null) delete root.dataset.accentColor;
			else root.setAttribute("data-accent-color", previousAccentColor);
			if (previousUserHue === null) delete root.dataset.userHue;
			else root.setAttribute("data-user-hue", previousUserHue);
			for (const { property, value, priority } of previousColors) {
				if (value === "") root.style.removeProperty(property);
				else root.style.setProperty(property, value, priority);
			}
		};
	}, [color, hue, theme]);
	
	return <span data-profile-appearance hidden aria-hidden="true"/>;
}
