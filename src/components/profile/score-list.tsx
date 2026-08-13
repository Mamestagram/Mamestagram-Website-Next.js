"use client";

import { Children, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/profile.module.css";

const COLLAPSED_SCORE_COUNT = 5;

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
	const canExpand = count > COLLAPSED_SCORE_COUNT;
	const items = Children.toArray(children);
	const previewItems = count > 0 ? items.slice(0, COLLAPSED_SCORE_COUNT) : items;

	useEffect(() => {
		if (!isOpen) return;
		const previousOverflow = document.body.style.overflow;
		const returnFocusTarget = openButtonRef.current;
		const handleDialogKeys = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
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
	}, [isOpen]);

	return (
		<>
			<div className={`${styles.score_list} ${styles.score_list_preview}`}>
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
					     if (event.target === event.currentTarget) setIsOpen(false);
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
									<small>Player Scores</small>
									<strong id={titleId}>{title}</strong>
								</span>
							</span>
							<span className={styles.score_modal_count}>{count.toLocaleString("en-US")}</span>
							<button ref={closeButtonRef}
							        className={styles.score_modal_close}
							        type="button"
							        aria-label="Close player scores"
							        onClick={() => setIsOpen(false)}>
								<FontAwesome prefix="fas" name="xmark"/>
							</button>
						</div>
						<div className={styles.score_modal_body}>
							<div className={`${styles.container} ${styles.score_modal_scope}`}>
								<div className={`${styles.section_area} ${styles.map_scores}`}>
									<div className={styles.player_scores}>
										<div className={styles.list_container}>
											<div className={styles.score_list}>{children}</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>
				</div>,
				document.body
			)}
		</>
	);
}
