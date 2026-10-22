"use client";

import classNames from "classnames";
import { useRef, type CSSProperties, type ReactNode } from "react";
import {
	hexToHsl,
	getProfileUiContentMinHeight,
	isProfileUiRowHeight,
	isProfileUiAutoHeight,
	getProfileUiRowHeightMatches,
	getProfileUiContentHeightLimits,
	type ProfileUiItem,
	type ProfileUiContent,
} from "@/lib/profile-ui";
import styles from "@s/profile.module.css";
import responsiveStyles from "@s/profile-ui-responsive.module.css";
import { getProfileUiScoreLayoutStyle } from "@/lib/profile-ui-score-layout";
import { useProfileUiWidths } from "@/lib/use-profile-ui-widths";
import { useProfileUiCompactLayout } from "@/lib/use-profile-ui-compact-layout";

type ProfileUiStyle = CSSProperties & {
	"--profile-ui-content-span"?: number;
	"--profile-ui-height"?: string;
	"--profile-ui-min-height"?: string;
	"--profile-ui-edge-radius"?: string;
	"--profile-ui-box-opacity"?: number;
	"--profile-ui-color-hue"?: number;
	"--profile-ui-color-saturation"?: string;
	"--profile-ui-color-lightness"?: string;
};

const scoreContents = new Set<ProfileUiContent>([
	"bestpp",
	"first_place",
	"most_played",
	"recent_played",
]);

const getContentStyle = (
	content: ProfileUiItem,
): ProfileUiStyle => {
	const style: ProfileUiStyle = {
		"--profile-ui-content-span": Math.round(content.width * 100),
		"--profile-ui-min-height": `${getProfileUiContentHeightLimits(content.content)?.min ?? 0}px`,
		"--profile-ui-height":
			isProfileUiRowHeight(content.content) || content.height === -1
				? "auto"
				: `${Math.max(content.height, getProfileUiContentMinHeight(content.content))}px`,
		"--profile-ui-edge-radius": `${content.edgeRadius}px`,
		"--profile-ui-box-opacity": content.boxOpacity,
	};
	if (content.color !== null) {
		const color = hexToHsl(content.color);
		style["--profile-ui-color-hue"] = color.hue;
		style["--profile-ui-color-saturation"] = `${color.saturation}%`;
		style["--profile-ui-color-lightness"] = `${color.lightness}%`;
	}
	return style;
};

export default function ProfileUiLayout({
	items,
	contents,
}: Readonly<{
	items: ProfileUiItem[];
	contents: Record<ProfileUiContent, ReactNode>;
}>) {
	const gridRef = useRef<HTMLDivElement>(null);
	const { contents: layoutItems, defaultArrangement } = useProfileUiWidths(gridRef, items);
	useProfileUiCompactLayout(gridRef);
	const rowMatches = getProfileUiRowHeightMatches(layoutItems);
	return (
		<div ref={gridRef} className={classNames(styles.profile_ui_layout, responsiveStyles.profile_ui_responsive, {
			[responsiveStyles.profile_ui_default_layout]: defaultArrangement,
		})} data-profile-ui-default={defaultArrangement} style={getProfileUiScoreLayoutStyle()}>
			{layoutItems.map((content, index) => (
				<section className={classNames(styles.section_area, styles.profile_ui_slot, {
					[styles.hero]: content.content === "info" || content.content === "stats",
					[styles.map_scores]: scoreContents.has(content.content) || content.content === "achievements",
				})} style={getContentStyle(content)} data-content={content.content} data-row-height={isProfileUiRowHeight(content.content)} data-auto-height={isProfileUiAutoHeight(content)} data-match-row={rowMatches[index]} key={`${content.content}-${index}`}>
					<div className={classNames(styles.profile_ui_content, {
						[styles.player_scores]: scoreContents.has(content.content),
						[styles.profile_ui_customized]: content.customized,
					})} data-fixed-height={!isProfileUiRowHeight(content.content) && content.height !== -1} data-custom-color={content.color !== null}>
						{contents[content.content]}
					</div>
				</section>
			))}
		</div>
	);
}
