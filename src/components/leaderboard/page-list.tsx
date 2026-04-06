"use client";

import classNames from "classnames";
import Link from "next/link";
import type { MouseEvent } from "react";
import { createRef, useRef, useState, useEffect } from "react";
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
	const buttonSize = 35, buttonGap = 10, displayAmount = 15;
	const pageRefs = Array.from({ length: displayAmount }, () => createRef<HTMLLIElement>());
	const longPressTimeout = useRef<NodeJS.Timeout>(undefined);
	const longPressInterval = useRef<NodeJS.Timeout>(undefined);
	const [refOrder, setRefOrder] = useState(Array.from( {length: displayAmount}, (_val, i) => i));
	
	const shiftRefOrder = (element: HTMLButtonElement | HTMLLIElement) => {
		if (element.classList.contains("left")) {
			setRefOrder((prevState) => {
				if (prevState.at(0)! > 0) {
					const nextState = [...prevState];
					nextState.unshift(nextState.pop()!);
					nextState[0] = nextState.at(1)! - 1;
					return nextState;
				}
				else {
					return prevState;
				}
			});
		}
		else if (element.classList.contains("right") && refOrder.at(-1)! < page.total - 1) {
			setRefOrder((prevState) => {
				if (prevState.at(-1)! < page.total - 1) {
					const nextState = [...prevState];
					nextState.push(nextState.shift()!);
					nextState[nextState.length - 1] = nextState.at(-2)! + 1;
					return nextState;
				}
				else {
					return prevState;
				}
			})
		}
	}
	
	const clickChevron = (e: MouseEvent<HTMLButtonElement>) => {
		const element = e.currentTarget;
		shiftRefOrder(element);
		longPressTimeout.current = setTimeout(() => {
			longPressInterval.current = setInterval(() => shiftRefOrder(element), 200);
			
			clearTimeout(longPressTimeout.current);
			longPressTimeout.current = setTimeout(() => {
				clearInterval(longPressInterval.current);
				longPressInterval.current = setInterval(() => shiftRefOrder(element), 100);
			}, 1200);
		}, 300);
	}
	
	const pointerUpChevron = () => {
		clearTimeout(longPressTimeout.current);
		clearInterval(longPressInterval.current);
	}
	
	useEffect(() => {
		const translateX = Math.min(0, (buttonSize + buttonGap) * Math.floor(displayAmount / 2) - (buttonSize + buttonGap) * refOrder.at(Math.floor(displayAmount / 2))!);
		document.querySelectorAll(`.${styles.page_wrapper} .${styles.page_list} li.${styles.show}`)?.forEach((element) => {
			element.classList.remove(styles.show);
		});
		pageRefs.forEach((ref, i) => {
			const pageListElement = Array.from(document.querySelectorAll(`.${styles.page_wrapper} .${styles.page_list} li`));
			ref.current = refOrder.at(i)! >= 0 ? pageListElement.at(refOrder.at(i)!)! as HTMLLIElement : null;
		});
		pageRefs.forEach((ref) => { ref.current?.classList.add(styles.show); });
		(document.querySelector(`.${styles.page_wrapper} .${styles.page_list}`) as HTMLUListElement).style.setProperty("--translate-x", `${translateX}px`);
	}, [refOrder, pageRefs]);
	
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
			        onPointerDown={clickChevron}
			        onPointerUp={pointerUpChevron}
			        onPointerLeave={pointerUpChevron}
			        onPointerCancel={pointerUpChevron}
					onContextMenu={(e) => e.preventDefault()}>
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
					onPointerDown={clickChevron}
			        onPointerUp={pointerUpChevron}
					onPointerLeave={pointerUpChevron}
					onPointerCancel={pointerUpChevron}
					onContextMenu={(e) => e.preventDefault()}>
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