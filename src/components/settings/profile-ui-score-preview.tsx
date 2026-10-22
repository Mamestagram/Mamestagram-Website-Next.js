"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { getProfileUiScoreVisibleCount } from "@/lib/profile-ui";
import { getProfileUiScoreElementHeight, measureProfileUiScoreLayout } from "@/lib/profile-ui-score-layout";
import { PROFILE_UI_PREVIEW_HEIGHT_SCALE } from "@/lib/profile-ui-preview-layout";
import styles from "@s/settings.module.css";

export default function ProfileUiScorePreview({ height }: Readonly<{
	height: number;
}>) {
	const rowsRef = useRef<HTMLDivElement>(null);
	const [visibleCount, setVisibleCount] = useState(() => getProfileUiScoreVisibleCount(height));

	useLayoutEffect(() => {
		const list = rowsRef.current;
		const card = list?.closest("article");
		const surface = card?.querySelector<HTMLElement>(`.${styles.profile_ui_preview_surface}`);
		const heading = card?.querySelector<HTMLElement>(`.${styles.profile_ui_preview_heading}`);
		if (!list || !card || !surface || !heading) return;
		const update = () => setVisibleCount(getProfileUiScoreVisibleCount(
			getProfileUiScoreElementHeight(card) / PROFILE_UI_PREVIEW_HEIGHT_SCALE,
			Number.POSITIVE_INFINITY,
			measureProfileUiScoreLayout(surface, heading, list, PROFILE_UI_PREVIEW_HEIGHT_SCALE),
		));
		update();
		const observer = new ResizeObserver(update);
		observer.observe(card);
		observer.observe(heading);
		return () => observer.disconnect();
	}, [height]);

	return (
		<div
			className={styles.profile_ui_preview_score}
			data-fixed-height={height !== -1}
		>
			<div className={styles.profile_ui_preview_score_rows} ref={rowsRef}>
				{Array.from({ length: visibleCount }, (_, index) => (
					<span className={styles.profile_ui_preview_score_row} key={index}/>
				))}
			</div>
			<span className={styles.profile_ui_preview_score_more} aria-hidden="true"/>
		</div>
	);
}
