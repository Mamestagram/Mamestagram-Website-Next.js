"use client";

import classNames from "classnames";
import Link from "next/link";
import { MouseEvent } from "react";
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
	
	const clickChevron = (e: MouseEvent<HTMLButtonElement>) => {
		const element = e.currentTarget as HTMLButtonElement;
		console.log(pageRefs)
		const prevRefs = [...pageRefs];
		if (element.classList.contains("left")) {
			console.log(prevRefs)
			prevRefs.forEach((ref, i) => {
				console.log(prevRefs)
				if (i < pageRefs.length - 1) pageRefs[i + 1].current = ref.current;
			});
			pageRefs[0].current = pageRefs.at(1)!.current?.previousElementSibling as HTMLLIElement;
		}
		else if (element.classList.contains("right")) {
			prevRefs.forEach((ref, i) => {
				if (i > 0) pageRefs[i - 1].current = ref.current;
			});
			pageRefs[pageRefs.length - 1].current = pageRefs.at(-2)!.current?.nextElementSibling as HTMLLIElement;
		}
		
		document.querySelector(`.${styles.page_wrapper} .${styles.page_list} li.${styles.show}`)?.classList.remove(styles.show);
		pageRefs.forEach((ref) => { ref.current?.classList.add(styles.show); });
	}
	
	useEffect(() => {
		document.querySelector(`.${styles.page_wrapper} .${styles.page_list} li.${styles.show}`)?.classList.remove(styles.show);
		pageRefs.forEach((ref) => { ref.current?.classList.add(styles.show); });
	}, [pageRefs]);
	
	return (
		<div className={styles.page_wrapper}>
			{page.current > 1 &&
				<Link href={`/leaderboard/${mode}/${sortBy}?page=${page.current - 1}${queryStr}`}>
					<FontAwesome prefix="fas" name="chevrons-left"/>
				</Link>
			}
			<button className="shift left"
			        type="button"
			        aria-label="shift-left"
			        onClick={clickChevron}>
				<FontAwesome prefix="fas" name="chevron-left"/>
			</button>
			<ul className={styles.page_list}>
				{Array.from({ length: page.total }).map((_val, i) =>
					<li key={i}
					    className={classNames(`page-${i + 1}`, { [styles.current_page]: i + 1 === page.current })}
					    ref={Math.abs(i + 1 - page.current) <= 2 ? pageRefs[i - page.current + 3] : undefined}>
						<Link href={`/leaderboard/${mode}/${sortBy}?page=${i + 1}${queryStr}`}>{i + 1}</Link>
					</li>
				)}
			</ul>
			<button className="shift right"
			        type="button"
			        aria-label="shift-right"
					onClick={clickChevron}>
				<FontAwesome prefix="fas" name="chevron-right"/>
			</button>
			{page.current < page.total &&
				<Link href={`/leaderboard/${mode}/${sortBy}?page=${page.current + 1}${queryStr}`}>
					<FontAwesome prefix="fas" name="chevrons-right"/>
				</Link>
			}
		</div>
	);
}