"use client";

import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function FloatingCountryFlag({ className, code }: Readonly<{
	className?: string,
	code: string
}>) {
	const flagRef = useRef<HTMLSpanElement>(null);
	const hideTimerRef = useRef<number | null>(null);
	const showFrameRef = useRef<number | null>(null);
	const [tooltipPosition, setTooltipPosition] = useState<{ left: number, top: number } | null>(null);
	const [isTooltipVisible, setIsTooltipVisible] = useState(false);
	const updateTooltipPosition = useCallback(() => {
		const rect = flagRef.current?.getBoundingClientRect();
		if (!rect) return;
		setTooltipPosition({
			left: Math.min(Math.max(rect.left + rect.width / 2, 28), window.innerWidth - 28),
			top: rect.top - 8
		});
	}, []);
	
	useEffect(() => {
		if (!tooltipPosition) return;
		window.addEventListener("resize", updateTooltipPosition);
		document.addEventListener("scroll", updateTooltipPosition, true);
		return () => {
			window.removeEventListener("resize", updateTooltipPosition);
			document.removeEventListener("scroll", updateTooltipPosition, true);
		};
	}, [tooltipPosition, updateTooltipPosition]);
	
	useEffect(() => () => {
		if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
		if (showFrameRef.current !== null) window.cancelAnimationFrame(showFrameRef.current);
	}, []);
	
	const showTooltip = () => {
		if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
		if (showFrameRef.current !== null) window.cancelAnimationFrame(showFrameRef.current);
		setIsTooltipVisible(false);
		updateTooltipPosition();
		showFrameRef.current = window.requestAnimationFrame(() => {
			showFrameRef.current = window.requestAnimationFrame(() => setIsTooltipVisible(true));
		});
	};
	const hideTooltip = () => {
		if (showFrameRef.current !== null) window.cancelAnimationFrame(showFrameRef.current);
		setIsTooltipVisible(false);
		hideTimerRef.current = window.setTimeout(() => setTooltipPosition(null), 180);
	};
	
	return (
		<span ref={flagRef}
		      className={classNames("country-flag", className)}
		      role="img"
		      aria-label={code.toUpperCase()}
		      onMouseEnter={showTooltip}
		      onMouseLeave={hideTooltip}>
			<i className={`fi fi-${code}`}></i>
			{tooltipPosition && createPortal(
				<span className="country-flag-floating-tooltip"
				      data-visible={isTooltipVisible}
				      style={{ left: tooltipPosition.left, top: tooltipPosition.top }}>
					{code.toUpperCase()}
				</span>,
				document.body
			)}
		</span>
	);
}
