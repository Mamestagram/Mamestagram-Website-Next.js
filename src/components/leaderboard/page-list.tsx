"use client";

import classNames from "classnames";
import Link from "next/link";
import { createRef, useEffect } from "react";
import { OsuMode } from "@/lib/mode";
import { SortBy } from "@/database/leaderboard";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/leaderboard.module.css";

export default function PageList({ page, mode, sortBy, isClan, country }: {
	page: {
		current: number,
		total: number
	},
	mode: OsuMode,
	sortBy: SortBy,
	isClan: boolean,
	country: string | undefined
}) {
	const queries: string[] = [];
	const conds: [string, boolean][] = [
		["clan", isClan],
		[`country=${country}`, country !== undefined]
	];
	conds.forEach(([query, cond]) => { if (cond) queries.push(query); });
	const queryStr = queries.length > 0 ? `&${queries.join("&")}` : "";
	const pageRefs = Array.from({ length: 5 }, () => createRef<HTMLLIElement>());
	
	const clickChevron = (e: MouseEvent) => {
		const element = e.target as HTMLButtonElement;
		const prevRefs = [...pageRefs];
		prevRefs.forEach((ref, i) => {
			if (element.classList.contains("left") && i > 0) {
			
			}
			else if (element.classList.contains("right") && i > 0) {
			
			}
		});
	}
	
	useEffect(() => {
		document.querySelector(`.${styles.page_wrapper} .${styles.page_list} li`)?.classList.remove("show");
		pageRefs.forEach((ref) => { ref.current?.classList.add("show"); });
	}, [pageRefs]);
	
	return (
		<div className={styles.page_wrapper}>
			{page.current > 1 &&
				<Link href={`/leaderboard/${mode}/${sortBy}?page=${page.current - 1}${queryStr}`}>
					<FontAwesome prefix="fas" name="chevrons-left"/>
				</Link>
			}
			<button className="shift left"><FontAwesome prefix="fas" name="chevron-left"/></button>
			<ul className={styles.page_list}>
				{Array.from({ length: page.total }).map((_val, i) =>
					<li key={i}
					    className={classNames(`page-${i + 1}`, { [styles.current_page]: i + 1 === page.current })}
					    ref={Math.abs(i + 1 - page.current) <= 2 ? pageRefs[i - page.current + 3] : undefined}>
						<Link href={`/leaderboard/${mode}/${sortBy}?page=${i + 1}${queryStr}`}>{i + 1}</Link>
					</li>
				)}
			</ul>
			<button className="shift right"><FontAwesome prefix="fas" name="chevron-right"/></button>
			{page.current < page.total &&
				<Link href={`/leaderboard/${mode}/${sortBy}?page=${page.current + 1}${queryStr}`}>
					<FontAwesome prefix="fas" name="chevrons-right"/>
				</Link>
			}
		</div>
	);
}