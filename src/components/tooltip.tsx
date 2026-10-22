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
	description,
	children
}: Readonly<{
	className?: string,
	tooltipClassName?: string,
	direction?: "up" | "down",
	bubble?: boolean,
	portal?: boolean,
	description?: ReactNode,
	children?: ReactNode
}>) {
	const anchorRef = useRef<HTMLSpanElement>(null);
	const tooltipRef = useRef<HTMLParagraphElement>(null);
	const tooltipId = useId();
	const [isOpen, setIsOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [position, setPosition] = useState<PortalPosition | null>(null);
	const hasDescription = description !== undefined && description !== null;
	const showPortal = () => {
		if (!portal || !hasDescription) return;
		setIsClosing(false);
		setIsOpen(true);
	};
	const hidePortal = () => {
		if (portal && isOpen) setIsClosing(true);
	};

	const updatePosition = useCallback(() => {
		const anchor = anchorRef.current;
		const tooltip = tooltipRef.current;
		if (!anchor || !tooltip) return;

		const viewportPadding = 8;
		const gap = bubble ? 12 : 8;
		const anchorRect = anchor.getBoundingClientRect();
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
	}, [bubble, direction]);

	useLayoutEffect(() => {
		if (!portal || !isOpen) return;
		updatePosition();
	}, [isOpen, portal, updatePosition]);

	useEffect(() => {
		if (!portal || !isOpen) return;
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);
		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [isOpen, portal, updatePosition]);

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
			onFocus={showPortal}
			onBlur={(event) => {
				const nextTarget = event.relatedTarget;
				if (
					portal &&
					(!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget))
				)
					hidePortal();
			}}
			tabIndex={portal ? 0 : undefined}
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
