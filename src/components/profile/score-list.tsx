"use client";

import {
	Children,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
	type PointerEvent as ReactPointerEvent,
	type ReactNode
} from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import styles from "@s/profile.module.css";

const COLLAPSED_SCORE_COUNT = 5;

type TooltipState = {
	text: string,
	anchorX: number,
	left: number,
	top: number,
	side: "above" | "below"
};

export default function ScoreList({ children, count, title }: {
	children: ReactNode,
	count: number,
	title: string
}) {
	const [isOpen, setIsOpen] = useState(false);
	const titleId = useId();
	const dialogRef = useRef<HTMLElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const openButtonRef = useRef<HTMLButtonElement>(null);
	const tooltipRef = useRef<HTMLSpanElement>(null);
	const activeTooltipTargetRef = useRef<HTMLElement | null>(null);
	const [tooltip, setTooltip] = useState<TooltipState | null>(null);
	const canExpand = count > COLLAPSED_SCORE_COUNT;
	const items = Children.toArray(children);
	const previewItems = count > 0 ? items.slice(0, COLLAPSED_SCORE_COUNT) : items;
	const showTooltip = (element: HTMLElement) => {
		const text = element.dataset.scoreTooltip;
		if (!text) return;
		const bounds = element.getBoundingClientRect();
		const anchorX = bounds.left + bounds.width / 2;
		const side = bounds.bottom < window.innerHeight * .72 ? "below" : "above";
		setTooltip({
			text,
			anchorX,
			left: anchorX,
			top: side === "below" ? bounds.bottom + 10 : bounds.top - 10,
			side
		});
	};
	const handleTooltipPointerOver = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (!(event.target instanceof Element)) return;
		const target = event.target.closest<HTMLElement>("[data-score-tooltip]");
		if (!target || !event.currentTarget.contains(target)
			|| activeTooltipTargetRef.current === target) return;
		activeTooltipTargetRef.current = target;
		showTooltip(target);
	};
	const handleTooltipPointerOut = (event: ReactPointerEvent<HTMLDivElement>) => {
		const activeTarget = activeTooltipTargetRef.current;
		if (!activeTarget) return;
		if (event.relatedTarget instanceof Node && activeTarget.contains(event.relatedTarget)) return;

		activeTooltipTargetRef.current = null;
		setTooltip(null);
	};
	const closeScores = useCallback(() => {
		activeTooltipTargetRef.current = null;
		setTooltip(null);
		setIsOpen(false);
	}, []);

	useLayoutEffect(() => {
		const element = tooltipRef.current;
		if (!element || !tooltip) return;
		const bounds = element.getBoundingClientRect();
		const pagePadding = 12;
		let shift = 0;
		if (bounds.left < pagePadding) shift = pagePadding - bounds.left;
		else if (bounds.right > window.innerWidth - pagePadding) {
			shift = window.innerWidth - pagePadding - bounds.right;
		}
		if (shift !== 0) setTooltip((current) => current ? { ...current, left: current.left + shift } : null);
	}, [tooltip]);

	useEffect(() => {
		if (!isOpen) return;
		const previousOverflow = document.body.style.overflow;
		const returnFocusTarget = openButtonRef.current;
		const handleDialogKeys = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeScores();
				return;
			}
			if (event.key !== "Tab" || !dialogRef.current) return;

			const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
			);
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (!first || !last) return;
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			}
			else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", handleDialogKeys);
		requestAnimationFrame(() => closeButtonRef.current?.focus());

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", handleDialogKeys);
			requestAnimationFrame(() => returnFocusTarget?.focus());
		};
	}, [closeScores, isOpen]);

	return (
		<>
			<div className={`${styles.score_list} ${styles.score_list_preview}`}
			     onPointerOver={handleTooltipPointerOver}
			     onPointerOut={handleTooltipPointerOut}>
				{previewItems}
			</div>
			{canExpand &&
				<button ref={openButtonRef}
				        className={styles.score_list_toggle}
				        type="button"
				        aria-haspopup="dialog"
				        onClick={() => setIsOpen(true)}>
					<span>{`Show all ${count}`}</span>
					<FontAwesome prefix="fas" name="arrow-up-right-from-square"/>
				</button>}
			{isOpen && createPortal(
				<div className={styles.score_modal_overlay}
				     role="presentation"
				     onMouseDown={(event) => {
					     if (event.target === event.currentTarget) closeScores();
				     }}>
					<section ref={dialogRef}
					         className={styles.score_modal}
					         role="dialog"
					         aria-modal="true"
					         aria-labelledby={titleId}>
						<div className={styles.score_modal_heading}>
							<span className={styles.score_modal_identity}>
								<span className={styles.score_modal_icon}>
									<FontAwesome prefix="fad" name="rectangle-list"/>
								</span>
								<span>
									<strong id={titleId}>{title}</strong>
								</span>
							</span>
							<span className={styles.score_modal_count}><FormattedNumber value={count}/></span>
							<button ref={closeButtonRef}
							        className={styles.score_modal_close}
							        type="button"
							        aria-label="Close player scores"
							        onClick={closeScores}>
								<FontAwesome prefix="fas" name="xmark"/>
							</button>
						</div>
						<div className={styles.score_modal_body}>
							<div className={`${styles.container} ${styles.score_modal_scope}`}>
								<div className={`${styles.section_area} ${styles.map_scores}`}>
									<div className={styles.player_scores}>
										<div className={styles.list_container}>
											<div className={styles.score_list}
											     onPointerOver={handleTooltipPointerOver}
											     onPointerOut={handleTooltipPointerOut}>{children}</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>
				</div>,
				document.body
			)}
			{tooltip && createPortal(
				<span ref={tooltipRef}
				      className={styles.score_text_tooltip}
				      data-side={tooltip.side}
				      role="tooltip"
				      style={{
					      "--score-tooltip-arrow-offset": `${tooltip.anchorX - tooltip.left}px`,
					      left: tooltip.left,
					      top: tooltip.top
				      } as CSSProperties}>
					{tooltip.text}
				</span>,
				document.body
			)}
		</>
	);
}
