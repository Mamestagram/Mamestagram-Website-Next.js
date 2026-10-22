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
	titleId,
	closeLabel,
	position,
	onClose,
	children,
}: Readonly<{
	title: string;
	titleId: string;
	closeLabel: string;
	position: PopoverAnchor;
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
			const fitted = getPopoverPosition({ ...position, x: position.x - left, y: position.y - top }, dialog.getBoundingClientRect(), {
				width,
				height,
			});
			fittedPosition = { left: fitted.left + left, top: fitted.top + top };
			followScroll();
		};
		updatePosition();
		const observer = new ResizeObserver(updatePosition);
		observer.observe(dialog);
		window.addEventListener("resize", updatePosition);
		window.visualViewport?.addEventListener("resize", updatePosition);
		window.visualViewport?.addEventListener("scroll", updatePosition);
		container?.addEventListener("scroll", followScroll, { passive: true });
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updatePosition);
			window.visualViewport?.removeEventListener("resize", updatePosition);
			window.visualViewport?.removeEventListener("scroll", updatePosition);
			container?.removeEventListener("scroll", followScroll);
		};
	}, [isMounted, position]);

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
			className={styles.profile_ui_settings_dialog}
			style={{ left: position.x, top: position.y }}
			role="dialog"
			aria-labelledby={titleId}
		>
			<div className={styles.profile_ui_dialog_heading}>
				<div>
					<small>Profile UI</small>
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
