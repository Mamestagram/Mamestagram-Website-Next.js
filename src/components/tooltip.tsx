"use client";

import classNames from "classnames";
import {
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { isTooltipFocusSuppressed } from "@/lib/tooltip-focus";

type PortalSide = "up" | "down";

type PortalPosition = {
	top: number;
	left: number;
	arrowOffset: number;
	side: PortalSide;
};

type PortalStyle = CSSProperties & {
	"--tooltip-arrow-offset": string;
};

export default function Tooltip({
	className,
	tooltipClassName,
	direction = "up",
	bubble = false,
	portal = false,
	focusable = true,
	description,
	children
}: Readonly<{
	className?: string,
	tooltipClassName?: string,
	direction?: "up" | "down",
	bubble?: boolean,
	portal?: boolean,
	focusable?: boolean,
	description?: ReactNode,
	children?: ReactNode
}>) {
	const anchorRef = useRef<HTMLSpanElement>(null);
	const visibilityObserverRef = useRef<IntersectionObserver | null>(null);
	const visibleAnchorRectRef = useRef<DOMRectReadOnly | null>(null);
	const tooltipRef = useRef<HTMLParagraphElement>(null);
	const tooltipId = useId();
	const [isOpen, setIsOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [position, setPosition] = useState<PortalPosition | null>(null);
	const hasDescription = description !== undefined && description !== null;
	const closePortal = useCallback(() => {
		visibilityObserverRef.current?.disconnect();
		visibilityObserverRef.current = null;
		visibleAnchorRectRef.current = null;
		setIsOpen(false);
		setIsClosing(false);
		setPosition(null);
	}, []);
	const showPortal = () => {
		if (!portal || !hasDescription || !anchorRef.current) return;
		visibilityObserverRef.current?.disconnect();
		const observer = new IntersectionObserver(([entry]) => {
			if (visibilityObserverRef.current !== observer) return;
			if (!entry?.isIntersecting || entry.intersectionRatio <= 0) {
				closePortal();
				return;
			}
			visibleAnchorRectRef.current = entry.intersectionRect;
			setIsClosing(false);
			setIsOpen(true);
			updatePosition();
		});
		visibilityObserverRef.current = observer;
		observer.observe(anchorRef.current);
	};
	const hidePortal = () => {
		visibilityObserverRef.current?.disconnect();
		visibilityObserverRef.current = null;
		if (portal && isOpen) setIsClosing(true);
	};

	const updatePosition = useCallback(() => {
		const anchor = anchorRef.current;
		const tooltip = tooltipRef.current;
		if (!anchor || !tooltip) return;
		const anchorRect = visibleAnchorRectRef.current;
		if (!anchorRect) {
			closePortal();
			return;
		}

		const viewportPadding = 8;
		const gap = bubble ? 12 : 8;
		const tooltipRect = tooltip.getBoundingClientRect();
		const fitsAbove = anchorRect.top - tooltipRect.height - gap >= viewportPadding;
		const fitsBelow = anchorRect.bottom + tooltipRect.height + gap <=
			window.innerHeight - viewportPadding;
		let side: PortalSide = direction;
		if (direction === "up" && !fitsAbove && fitsBelow) side = "down";
		if (direction === "down" && !fitsBelow && fitsAbove) side = "up";

		const centeredLeft = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;
		const maxLeft = Math.max(viewportPadding, window.innerWidth - tooltipRect.width - viewportPadding);
		const left = Math.min(Math.max(centeredLeft, viewportPadding), maxLeft);
		const top = side === "up"
			? Math.max(viewportPadding, anchorRect.top - tooltipRect.height - gap)
			: Math.min(
				anchorRect.bottom + gap,
				window.innerHeight - tooltipRect.height - viewportPadding,
			);
		const arrowOffset = Math.min(
			Math.max(anchorRect.left + anchorRect.width / 2 - left, 12),
			Math.max(12, tooltipRect.width - 12),
		);

		setPosition({ top, left, arrowOffset, side });
	}, [bubble, closePortal, direction]);

	useLayoutEffect(() => {
		if (!portal || !isOpen) return;
		const frame = requestAnimationFrame(updatePosition);
		return () => cancelAnimationFrame(frame);
	}, [isOpen, portal, updatePosition]);

	useEffect(() => {
		if (!portal || !isOpen) return;
		window.addEventListener("resize", closePortal);
		window.addEventListener("scroll", closePortal, true);
		window.visualViewport?.addEventListener("resize", closePortal);
		window.visualViewport?.addEventListener("scroll", closePortal);
		return () => {
			window.removeEventListener("resize", closePortal);
			window.removeEventListener("scroll", closePortal, true);
			window.visualViewport?.removeEventListener("resize", closePortal);
			window.visualViewport?.removeEventListener("scroll", closePortal);
		};
	}, [closePortal, isOpen, portal]);

	useEffect(() => () => visibilityObserverRef.current?.disconnect(), []);

	const portalStyle: PortalStyle | undefined = position ? {
		top: position.top,
		left: position.left,
		"--tooltip-arrow-offset": `${position.arrowOffset}px`,
	} : undefined;

	return (
		<span
			ref={anchorRef}
			className={classNames("tooltip-element", direction, className)}
			aria-describedby={portal && isOpen ? tooltipId : undefined}
			onPointerEnter={showPortal}
			onPointerLeave={hidePortal}
			onPointerDown={() => { if (portal) closePortal(); }}
			onDragStartCapture={() => { if (portal) closePortal(); }}
			onClick={() => { if (portal) closePortal(); }}
			onFocus={(event) => {
				if (!isTooltipFocusSuppressed(event.target)) showPortal();
			}}
			onBlur={(event) => {
				const nextTarget = event.relatedTarget;
				if (
					portal &&
					(!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget))
				)
					hidePortal();
			}}
			tabIndex={portal && focusable ? 0 : undefined}
		>
			{children}
			{hasDescription && !portal &&
				<p className={classNames("tooltip", { ["bubble"]: bubble })}>{description}</p>}
			{hasDescription && portal && isOpen && createPortal(
				<p
					ref={tooltipRef}
					id={tooltipId}
					role="tooltip"
					className={classNames("tooltip-portal", tooltipClassName, { ["bubble"]: bubble })}
					data-positioned={position !== null}
					data-side={position?.side ?? direction}
					data-state={isClosing ? "closing" : "open"}
					style={portalStyle}
					onAnimationEnd={(event) => {
						if (event.target !== event.currentTarget || !isClosing) return;
						setIsOpen(false);
						setIsClosing(false);
						setPosition(null);
					}}
				>
					{description}
				</p>,
				document.body,
			)}
		</span>
	);
}
