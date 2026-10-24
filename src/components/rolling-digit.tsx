"use client";

import { useLayoutEffect, useRef } from "react";
import { ROLLING_NUMBER_DURATION } from "@/lib/rolling-number";
import styles from "@s/rolling-number.module.css";

export default function RollingDigit({ frames, decreasing, animate }: Readonly<{
	frames: readonly number[];
	decreasing: boolean;
	animate: boolean;
}>) {
	const track = useRef<HTMLSpanElement>(null);
	const distance = frames.length - 1;
	const start = decreasing ? -distance : 0;
	const end = decreasing ? 0 : -distance;

	useLayoutEffect(() => {
		if (!animate || distance === 0 || !track.current) return;
		const animation = track.current.animate([
			{ transform: `translateY(${start}em)` },
			{ transform: `translateY(${end}em)` }
		], {
			duration: ROLLING_NUMBER_DURATION,
			easing: "ease"
		});
		return () => animation.cancel();
	}, [animate, distance, end, frames, start]);

	return <span className={styles.digit}>
		<span ref={track} className={styles.track} style={{ transform: `translateY(${end}em)` }}>
			{frames.map((value, index) => <span key={index}>{value}</span>)}
		</span>
	</span>;
}
