"use client";

import { Fragment, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import RollingDigit from "@/components/rolling-digit";
import { createRollingDigits, ROLLING_NUMBER_DURATION } from "@/lib/rolling-number";
import styles from "@s/rolling-number.module.css";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeToMotion = (onChange: () => void) => {
	const preference = window.matchMedia(MOTION_QUERY);
	preference.addEventListener("change", onChange);
	return () => preference.removeEventListener("change", onChange);
};
const getReducedMotion = () => window.matchMedia(MOTION_QUERY).matches;
const getServerReducedMotion = () => false;

export default function RollingNumber({ value }: Readonly<{ value: number | null }>) {
	const [transition, setTransition] = useState({ from: value, to: value, running: false });
	const reducedMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, getServerReducedMotion);
	if (transition.to !== value) {
		setTransition({ from: transition.to, to: value, running: transition.to !== null && value !== null });
	}
	const animate = transition.running && !reducedMotion;
	const decreasing = transition.from !== null && transition.to !== null && transition.to < transition.from;
	const digits = useMemo(() => transition.to === null ? [] : createRollingDigits(
		animate ? transition.from ?? transition.to : transition.to,
		transition.to
	), [animate, transition.from, transition.to]);

	useEffect(() => {
		if (!transition.running) return;
		const target = transition.to;
		const timeout = window.setTimeout(() => {
			setTransition((current) => current.to === target
				? { from: target, to: target, running: false } : current);
		}, reducedMotion ? 0 : ROLLING_NUMBER_DURATION + 32);
		return () => window.clearTimeout(timeout);
	}, [reducedMotion, transition.running, transition.to]);

	const formatted = value === null ? "—" : value.toLocaleString("en-US");
	return <span className={styles.number} aria-label={formatted}>
		<span className={styles.readable}>{formatted}</span>
		<span className={styles.digits} aria-hidden="true">
			{value === null ? "—" : digits.map(({ place, frames }) => <Fragment key={place}>
				<RollingDigit frames={frames} decreasing={decreasing} animate={animate}/>
				{place > 0 && place % 3 === 0 && <span>,</span>}
			</Fragment>)}
		</span>
	</span>;
}
