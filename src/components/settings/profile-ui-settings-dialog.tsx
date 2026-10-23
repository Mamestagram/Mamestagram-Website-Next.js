"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import { getPopoverPosition, type PopoverAnchor } from "@/lib/popover-position";
import styles from "@s/settings.module.css";

const subscribeToClient = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ProfileUiSettingsDialog({
	title,
	className,
	eyebrow = "Profile UI",
	titleId,
	closeLabel,
	position,
	keepInViewport = false,
	onClose,
	children,
}: Readonly<{
	title: string;
	className?: string;
	eyebrow?: string;
	titleId: string;
	closeLabel: string;
	position: PopoverAnchor;
	keepInViewport?: boolean;
	onClose: () => void;
	children: ReactNode;
}>) {
	const isMounted = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);
	const dialogRef = useRef<HTMLElement>(null);

	useLayoutEffect(() => {
		const dialog = dialogRef.current;
		if (!isMounted || !dialog) return;
		const container = position.scrollContainer;
		const initialScrollLeft = container?.scrollLeft ?? 0;
		const initialScrollTop = container?.scrollTop ?? 0;
		const pageX = window.scrollX;
		const pageY = window.scrollY;
		let fittedPosition = { left: position.x, top: position.y };
		const followScroll = () => {
			dialog.style.left = `${fittedPosition.left + pageX - ((container?.scrollLeft ?? 0) - initialScrollLeft)}px`;
			dialog.style.top = `${fittedPosition.top + pageY - ((container?.scrollTop ?? 0) - initialScrollTop)}px`;
		};
		const updatePosition = () => {
			const viewport = window.visualViewport;
			const left = viewport?.offsetLeft ?? 0;
			const top = viewport?.offsetTop ?? 0;
			const width = Math.min(viewport?.width ?? window.innerWidth, document.documentElement.clientWidth);
			const height = Math.min(viewport?.height ?? window.innerHeight, document.documentElement.clientHeight);
			dialog.style.maxWidth = `${Math.max(0, width - 16)}px`;
			dialog.style.maxHeight = `${Math.max(0, height - 16)}px`;
			const anchor = keepInViewport ? {
				x: position.x + pageX - window.scrollX - ((container?.scrollLeft ?? 0) - initialScrollLeft),
				y: position.y + pageY - window.scrollY - ((container?.scrollTop ?? 0) - initialScrollTop),
			} : position;
			const fitted = getPopoverPosition({ x: anchor.x - left, y: anchor.y - top }, dialog.getBoundingClientRect(), {
				width,
				height,
			});
			fittedPosition = { left: fitted.left + left, top: fitted.top + top };
			if (keepInViewport) {
				dialog.style.left = `${fittedPosition.left}px`;
				dialog.style.top = `${fittedPosition.top}px`;
			} else followScroll();
		};
		updatePosition();
		const observer = new ResizeObserver(updatePosition);
		observer.observe(dialog);
		window.addEventListener("resize", updatePosition);
		window.visualViewport?.addEventListener("resize", updatePosition);
		window.visualViewport?.addEventListener("scroll", updatePosition);
		const onScroll = keepInViewport ? updatePosition : followScroll;
		if (keepInViewport) window.addEventListener("scroll", updatePosition, { passive: true });
		container?.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updatePosition);
			window.visualViewport?.removeEventListener("resize", updatePosition);
			window.visualViewport?.removeEventListener("scroll", updatePosition);
			if (keepInViewport) window.removeEventListener("scroll", updatePosition);
			container?.removeEventListener("scroll", onScroll);
		};
	}, [isMounted, position, keepInViewport]);

	useEffect(() => {
		if (!isMounted) return;
		const closeOutside = (event: PointerEvent) => {
			if (event.target instanceof Node && !dialogRef.current?.contains(event.target)) onClose();
		};
		document.addEventListener("pointerdown", closeOutside, true);
		return () => document.removeEventListener("pointerdown", closeOutside, true);
	}, [isMounted, onClose]);

	if (!isMounted) return null;

	return createPortal(
		<section
			ref={dialogRef}
			className={`${styles.profile_ui_settings_dialog}${className ? ` ${className}` : ""}`}
			style={{ left: position.x, top: position.y, ...(keepInViewport ? { position: "fixed" } : {}) }}
			role="dialog"
			aria-labelledby={titleId}
		>
			<div className={styles.profile_ui_dialog_heading}>
				<div>
					<small>{eyebrow}</small>
					<h3 id={titleId}>{title}</h3>
				</div>
				<button type="button" aria-label={closeLabel} onClick={onClose}>
					<FontAwesome prefix="fas" name="xmark"/>
				</button>
			</div>
			<div className={styles.profile_ui_dialog_body}>{children}</div>
		</section>,
		document.body,
	);
}
