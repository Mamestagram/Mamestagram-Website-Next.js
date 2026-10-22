"use client";

import { useLayoutEffect, useRef } from "react";
import styles from "@s/settings.module.css";

// Fewer full-size placeholders approximate the preview's half-height layout
// while preserving the medal dimensions and vertical gaps.
const groups = [
	{ name: "Skill", count: 18 },
	{ name: "Mod", count: 9 },
	{ name: "Mamestagram", count: 12 },
] as const;

export default function ProfileUiAchievementsPreview() {
	const bodyRef = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const body = bodyRef.current;
		const card = body?.closest("article");
		const heading = card?.querySelector<HTMLElement>(`.${styles.profile_ui_preview_heading}`);
		const surface = card?.querySelector<HTMLElement>(`.${styles.profile_ui_preview_surface}`);
		if (!body || !card || !surface || !heading) return;
		const updateHeight = () => {
			const cardStyle = getComputedStyle(card);
			const surfaceStyle = getComputedStyle(surface);
			const headingStyle = getComputedStyle(heading);
			const pixels = (value: string) => Number.parseFloat(value) || 0;
			const height = Math.ceil(body.getBoundingClientRect().height + heading.getBoundingClientRect().height +
				pixels(headingStyle.marginTop) + pixels(headingStyle.marginBottom) +
				pixels(surfaceStyle.paddingTop) + pixels(surfaceStyle.paddingBottom) +
				pixels(cardStyle.borderTopWidth) + pixels(cardStyle.borderBottomWidth));
			const value = `${height}px`;
			if (card.style.getPropertyValue("--profile-ui-preview-achievements-height") !== value)
				card.style.setProperty("--profile-ui-preview-achievements-height", value);
		};
		updateHeight();
		let frame: number | null = null;
		const observer = new ResizeObserver(() => {
			if (frame !== null) return;
			frame = requestAnimationFrame(() => {
				frame = null;
				updateHeight();
			});
		});
		observer.observe(body);
		observer.observe(heading);
		observer.observe(card);
		return () => {
			observer.disconnect();
			if (frame !== null) cancelAnimationFrame(frame);
			card.style.removeProperty("--profile-ui-preview-achievements-height");
		};
	}, []);

	return (
		<div ref={bodyRef} className={styles.profile_ui_preview_achievements} aria-hidden="true">
			<div className={styles.profile_ui_preview_achievement_collections}>
				{Array.from({ length: 4 }, (_, index) => (
					<div className={styles.profile_ui_preview_achievement_collection} key={index}>
						<span className={styles.profile_ui_preview_medal}/>
						<span className={styles.profile_ui_preview_achievement_stat}/>
						<span className={styles.profile_ui_preview_achievement_stat}/>
					</div>
				))}
			</div>
			{groups.map(({ name, count }) => (
				<div className={styles.profile_ui_preview_achievement_group} key={name}>
					<div className={styles.profile_ui_preview_achievement_group_heading}/>
					<div className={styles.profile_ui_preview_achievement_medals}>
						{Array.from({ length: count }, (_, index) => (
							<span
								className={styles.profile_ui_preview_medal}
								key={index}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
