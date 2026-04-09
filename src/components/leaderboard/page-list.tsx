"use client";

import classNames from "classnames";
import Link from "next/link";
import { MouseEvent, useRef, useState, useCallback, useEffect } from "react";
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
	const buttonSize = 35, buttonGap = 10;
	const longPressTimeout = useRef<NodeJS.Timeout>(undefined);
	const longPressInterval = useRef<NodeJS.Timeout>(undefined);
	const [displayAmount, setDisplayAmount] = useState(() => {
		if (typeof window !== "undefined") {
			if (window.innerWidth <= 346) return 1;
			else if (window.innerWidth <= 525) return 3;
			else return 7;
		}
		else {
			return 7;
		}
	});
	const [pageOrder, setPageOrder] = useState<number[]>(Array.from({ length: displayAmount },
		(_val, i) => i + page.current - 1 - Math.floor(displayAmount / 2)));
	
	const resizeWindow = useCallback(() => {
		if (window.innerWidth <= 346) {
			setDisplayAmount(1);
			setPageOrder((prevState) => prevState.slice(
				Math.floor(prevState.length / 2) - Math.floor(displayAmount / 2),
				Math.floor(prevState.length / 2) + Math.floor(displayAmount / 2)
			));
		}
		else if (window.innerWidth <= 525) {
			setDisplayAmount(3);
			setPageOrder((prevState) => {
				const nextState = [...prevState];
				if (prevState.length > displayAmount) {
					for (let i: number = 0; i < (prevState.length - displayAmount) / 2; i++) {
						nextState.pop();
						nextState.shift();
					}
				}
				else {
					for (let i: number = 0; i < (displayAmount - prevState.length) / 2; i++) {
						nextState.unshift(nextState.at(0)! - 1);
						nextState.push(nextState.at(-1)! + 1);
					}
				}
				return nextState;
			});
		}
		else {
			setDisplayAmount(7);
			setPageOrder((prevState) => {
				const nextState = [...prevState];
				for (let i: number = 0; i < (displayAmount - prevState.length) / 2; i++) {
					nextState.unshift(nextState.at(0)! - 1);
					nextState.push(nextState.at(-1)! + 1);
				}
				return nextState;
			});
		}
		console.log(pageOrder);
	}, [displayAmount, pageOrder]);
	
	const shiftRefOrder = (element: HTMLButtonElement | HTMLLIElement) => {
		if (element.classList.contains("left")) {
			setPageOrder((prevState) => {
				if (prevState.at(Math.floor(prevState.length / 2))! > 0) {
					const nextState = [...prevState];
					nextState.pop();
					nextState.unshift(nextState.at(0)! - 1);
					return nextState;
				}
				else {
					return prevState;
				}
			});
		}
		else if (element.classList.contains("right")) {
			setPageOrder((prevState) => {
				if (prevState.at(-Math.ceil(prevState.length / 2))! < page.total - 1) {
					const nextState = [...prevState];
					nextState.shift();
					nextState.push(nextState.at(-1)! + 1);
					return nextState;
				}
				else {
					return prevState;
				}
			})
		}
		else {
		
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
		window.addEventListener("resize", resizeWindow);
		return () => {
			window.removeEventListener("resize", resizeWindow);
		}
	}, [resizeWindow]);
	
	useEffect(() => {
		const translateX = (buttonSize + buttonGap) * Math.floor(displayAmount / 2) - (buttonSize + buttonGap) * pageOrder.at(Math.floor(displayAmount / 2))!;
		document.querySelectorAll(`.${styles.page_wrapper} .${styles.page_list} li`)?.forEach((element, i) => {
			element.classList.remove(styles.show);
			if (pageOrder.includes(i))
				element.classList.add(styles.show);
		});
		(document.querySelector(`.${styles.page_wrapper} .${styles.page_list}`) as HTMLUListElement).style.setProperty("--translate-x", `${translateX}px`);
	}, [pageOrder, displayAmount]);
	
	return (
		<div className={styles.page_wrapper}>
			{page.current > 1 &&
				<Link href={`/leaderboard/${mode}/${sortBy}?page=${page.current - 1}${queryStr}`}>
					<FontAwesome prefix="fas" name="chevrons-left"/>
				</Link>
			}
			<button className={classNames(styles.shift_arrow, "left")}
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
					<li key={i} className={classNames(`page-${i + 1}`, { [styles.current_page]: i + 1 === page.current })}>
						<Link href={`/leaderboard/${mode}/${sortBy}?page=${i + 1}${queryStr}`}>{i + 1}</Link>
					</li>
				)}
			</ul>
			<button className={classNames(styles.shift_arrow, "right")}
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