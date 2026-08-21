"use client";

import Link from "next/link";
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import FontAwesome from "@/components/font-awesome";
import ReplayViewer from "@/components/replay-viewer";
import styles from "@s/profile.module.css";

export default function PlayerScoreCard({ className, label, beatmapHref, replayUrl, children }: {
	className: string,
	label: string,
	beatmapHref: string,
	replayUrl: string,
	children: ReactNode
}) {
	const [isExpanded, setIsExpanded] = useState(false);
	const panelId = useId();

	const toggleExpanded = () => setIsExpanded((expanded) => !expanded);
	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		toggleExpanded();
	};

	return (
		<>
			<article className={styles.score_entry}
			         data-expanded={isExpanded}
			         data-rendering-item="medium">
				<div className={className}
				     role="button"
				     tabIndex={0}
				     aria-label={`${label}. ${isExpanded ? "Hide" : "Show"} score actions.`}
				     aria-expanded={isExpanded}
				     aria-controls={panelId}
				     onClick={toggleExpanded}
				     onKeyDown={handleKeyDown}>
					{children}
					<FontAwesome className={styles.score_expand_icon} prefix="fas" name="chevron-down"/>
				</div>
				<div id={panelId}
				     className={styles.score_action_reveal}
				     aria-hidden={!isExpanded}
				     inert={!isExpanded}>
					<div className={styles.score_action_inner}>
						<div className={styles.score_actions}>
							<Link href={beatmapHref}>
								<FontAwesome prefix="fad" name="circle-info"/>
								<span>Beatmap info</span>
								<FontAwesome prefix="fas" name="arrow-up-right"/>
							</Link>
							<ReplayViewer label={label}
							              replayUrl={replayUrl}
							              buttonLabel="Watch replay">
								<FontAwesome prefix="fad" name="circle-play"/>
								<span>Watch replay</span>
								<FontAwesome prefix="fas" name="window-maximize"/>
							</ReplayViewer>
						</div>
					</div>
				</div>
			</article>
		</>
	);
}
