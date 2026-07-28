"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import classNames from "classnames";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/profile.module.css";

const COLLAPSED_SCORE_COUNT = 5;
const SCORE_ROW_HEIGHT = 58;
const SCORE_ROW_GAP = 6;

export default function ScoreList({ children, count }: {
	children: ReactNode,
	count: number
}) {
	const [isExpanded, setIsExpanded] = useState(false);
	const listId = useId();
	const canExpand = count > COLLAPSED_SCORE_COUNT;
	const listStyle = {
		"--expanded-score-list-height": `${count * SCORE_ROW_HEIGHT + (count - 1) * SCORE_ROW_GAP}px`
	} as CSSProperties;

	return (
		<>
			<div id={listId}
			     className={classNames(styles.score_list, { [styles.expanded]: isExpanded })}
			     style={listStyle}>
				{children}
			</div>
			{canExpand &&
				<button className={styles.score_list_toggle}
				        type="button"
				        aria-controls={listId}
				        aria-expanded={isExpanded}
				        onClick={() => setIsExpanded((expanded) => !expanded)}>
					<span>{isExpanded ? "Show less" : `Show all ${count}`}</span>
					<FontAwesome prefix="fas" name={isExpanded ? "chevron-up" : "chevron-down"}/>
				</button>}
		</>
	);
}
