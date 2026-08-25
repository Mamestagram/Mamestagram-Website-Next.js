"use client";

import classNames from "classnames";
import Link from "next/link";
import type { CSSProperties, MouseEvent } from "react";
import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import { OsuMode } from "@/lib/mode";
import { SortBy } from "@/database/leaderboard";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/leaderboard.module.css";

const makePageOrder = (centerIndex: number, displayAmount: number, totalPage: number) => {
	const length = Math.min(displayAmount, totalPage);
	const start = Math.min(
		Math.max(centerIndex - Math.floor(length / 2), 0),
		Math.max(totalPage - length, 0)
	);
	return Array.from({ length }, (_val, i) => start + i);
};

export default function PageList({ currentPage, totalPage, mode, sortBy, isClan, country }: {
	currentPage: number,
	totalPage: number,
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
	conds.forEach(([query, cond]) => {
		if (cond) queries.push(query);
	});
	const queryStr = queries.length > 0 ? `&${queries.join("&")}` : "";
	const buttonSize = 35, buttonGap = 10;
	const longPressTimeout = useRef<NodeJS.Timeout>(undefined);
	const longPressInterval = useRef<NodeJS.Timeout>(undefined);
	const pageWrapperRef = useRef<HTMLDivElement>(null);
	const previousPosition = useRef<DOMRect>(null);
	const positionAnimation = useRef<Animation>(null);
	const isOverRankingRef = useRef(false);
	const [isOverRanking, setIsOverRanking] = useState(false);
	const [displayAmount, setDisplayAmount] = useState(7);
	const [pageOrder, setPageOrder] = useState<number[]>(() =>
		makePageOrder(currentPage - 1, displayAmount, totalPage));
	const pageTranslateX = -1 * (buttonSize + buttonGap) * (pageOrder.at(0) ?? 0);
	const pageListWidth = buttonSize * pageOrder.length + buttonGap * Math.max(pageOrder.length - 1, 0);
	const isFirstPageWindow = (pageOrder.at(0) ?? 0) === 0;
	const isLastPageWindow = (pageOrder.at(-1) ?? totalPage - 1) >= totalPage - 1;
	const pageListStyle = {
		"--translate-x": `${pageTranslateX}px`,
		"--page-list-width": `${pageListWidth}px`
	} as CSSProperties;
	
	const resizeWindow = useCallback(() => {
		let nextDisplayAmount = 7;
		if (window.innerWidth <= 346) {
			nextDisplayAmount = 1;
		}
		else if (window.innerWidth <= 525) {
			nextDisplayAmount = 3;
		}
		setDisplayAmount(nextDisplayAmount);
		setPageOrder(makePageOrder(currentPage - 1, nextDisplayAmount, totalPage));
	}, [currentPage, totalPage]);
	
	const shiftRefOrder = (element: HTMLButtonElement | HTMLLIElement, index?: number) => {
		if (element.classList.contains("left")) {
			setPageOrder((prevState) => {
				if ((prevState.at(0) ?? 0) <= 0) return prevState;
				return prevState.map((page) => page - 1);
			});
		}
		else if (element.classList.contains("right")) {
			setPageOrder((prevState) => {
				if ((prevState.at(-1) ?? totalPage - 1) >= totalPage - 1) return prevState;
				return prevState.map((page) => page + 1);
			})
		}
		else {
			setPageOrder(makePageOrder(index!, displayAmount, totalPage));
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
		const initialResizeFrame = window.requestAnimationFrame(resizeWindow);
		window.addEventListener("resize", resizeWindow);
		return () => {
			window.cancelAnimationFrame(initialResizeFrame);
			window.removeEventListener("resize", resizeWindow);
		}
	}, [resizeWindow]);
	
	useEffect(() => {
		let frameId = 0;
		const changeLayout = (nextValue: boolean) => {
			if (nextValue === isOverRankingRef.current) return;
			if (pageWrapperRef.current)
				previousPosition.current = pageWrapperRef.current.getBoundingClientRect();
			isOverRankingRef.current = nextValue;
			setIsOverRanking(nextValue);
		};
		const updatePosition = () => {
			frameId = 0;
			const ranking = document.querySelector<HTMLElement>(`.${styles.table_wrapper}`);
			if (!ranking || window.innerWidth <= 1155) {
				changeLayout(false);
				return;
			}
			
			const rect = ranking.getBoundingClientRect();
			changeLayout(rect.top <= 72 + buttonSize + 16 && rect.bottom >= 72);
		};
		const scheduleUpdate = () => {
			if (frameId === 0) frameId = window.requestAnimationFrame(updatePosition);
		};
		
		scheduleUpdate();
		window.addEventListener("scroll", scheduleUpdate, { passive: true });
		window.addEventListener("resize", scheduleUpdate);
		return () => {
			window.cancelAnimationFrame(frameId);
			window.removeEventListener("scroll", scheduleUpdate);
			window.removeEventListener("resize", scheduleUpdate);
		};
	}, [buttonSize]);
	
	useLayoutEffect(() => {
		const wrapper = pageWrapperRef.current, previous = previousPosition.current;
		previousPosition.current = null;
		if (!wrapper || !previous || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		
		positionAnimation.current?.cancel();
		const next = wrapper.getBoundingClientRect();
		const deltaX = previous.left - next.left, deltaY = previous.top - next.top;
		const targetTransform = window.getComputedStyle(wrapper).transform;
		const baseTransform = targetTransform === "none" ? "" : targetTransform;
		positionAnimation.current = wrapper.animate([
			{ transform: `translate(${deltaX}px, ${deltaY}px) ${baseTransform}`, opacity: .55 },
			{ transform: targetTransform, opacity: 1 }
		], {
			duration: 420,
			easing: "cubic-bezier(.22, 1, .36, 1)"
		});
		
		return () => positionAnimation.current?.cancel();
	}, [isOverRanking]);
	
	return (
		<div ref={pageWrapperRef}
		     className={classNames(styles.page_wrapper, { [styles.over_ranking]: isOverRanking })}>
			<button className={styles.page_endpoint}
			        type="button"
			        aria-label="show first pages"
			        title="Show first pages"
			        disabled={isFirstPageWindow}
			        onClick={() => setPageOrder(makePageOrder(0, displayAmount, totalPage))}>
				<FontAwesome prefix="fad" name="chevrons-left"/>
			</button>
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
			<ul className={styles.page_list} style={pageListStyle}>
				{Array.from({ length: totalPage }).map((_val, i) =>
					<li key={i}
					    className={classNames(`page-${i + 1}`, {
						    [styles.floating_page]: pageOrder.includes(i),
						    [styles.current_page]: i + 1 === currentPage,
						    [styles.show]: pageOrder.includes(i)
					    })}
					    onClick={(e) => shiftRefOrder(e.currentTarget, i)}>
						<Link href={`/leaderboard/${mode}/${sortBy}?page=${i + 1}${queryStr}`}>
							{i + 1}
						</Link>
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
			<button className={styles.page_endpoint}
			        type="button"
			        aria-label="show last pages"
			        title="Show last pages"
			        disabled={isLastPageWindow}
			        onClick={() => setPageOrder(makePageOrder(totalPage - 1, displayAmount, totalPage))}>
				<FontAwesome prefix="fad" name="chevrons-right"/>
			</button>
		</div>
	);
}
