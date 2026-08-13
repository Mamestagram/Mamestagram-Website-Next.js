"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/support.module.css";

type FeatureMedia = {
	type: "image" | "video",
	src: string,
	alt: string,
	blurred?: boolean
};

type FeatureView = {
	body: string,
	available?: boolean,
	media?: FeatureMedia
};

export type SupportFeature = {
	icon: string,
	title: string,
	free?: FeatureView,
	supporter: FeatureView
};

export default function SupportFeatures({ features, labels }: {
	features: readonly SupportFeature[],
	labels: { free: string, supporter: string, available: string, unavailable: string }
}) {
	const [selectedSupporter, setSelectedSupporter] = useState(true);
	const [displaySupporter, setDisplaySupporter] = useState(true);
	const [transitionPhase, setTransitionPhase] = useState<"idle" | "out" | "in">("idle");
	const switchTimer = useRef<number | null>(null);
	const animationFrame = useRef<number | null>(null);

	useEffect(() => () => {
		if (switchTimer.current !== null) window.clearTimeout(switchTimer.current);
		if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
	}, []);

	const changeView = (supporter: boolean) => {
		if (supporter === selectedSupporter || transitionPhase !== "idle") return;
		setSelectedSupporter(supporter);

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setDisplaySupporter(supporter);
			return;
		}

		setTransitionPhase("out");
		switchTimer.current = window.setTimeout(() => {
			setDisplaySupporter(supporter);
			setTransitionPhase("in");
			animationFrame.current = window.requestAnimationFrame(() => {
				animationFrame.current = window.requestAnimationFrame(() => setTransitionPhase("idle"));
			});
		}, 240);
	};

	return (
		<>
			<div className={styles.comparison_bar}>
				<span>{selectedSupporter ? labels.supporter : labels.free}</span>
				<div role="group" aria-label="Compare free and supporter features">
					<button type="button"
					        data-active={!selectedSupporter}
					        aria-pressed={!selectedSupporter}
					        disabled={transitionPhase !== "idle"}
					        onClick={() => changeView(false)}>{labels.free}</button>
					<button type="button"
					        data-active={selectedSupporter}
					        aria-pressed={selectedSupporter}
					        disabled={transitionPhase !== "idle"}
					        onClick={() => changeView(true)}>{labels.supporter}</button>
				</div>
			</div>
			<div className={styles.feature_grid} data-phase={transitionPhase}>
				{features.map((feature, index) => {
					const view: FeatureView = displaySupporter
						? feature.supporter
						: feature.free ?? { body: labels.unavailable, available: false };
					const isAvailable = view.available !== false;
					return (
						<article key={feature.title} className={styles.feature_card} data-supporter={displaySupporter} data-page-enter="box">
							<div className={styles.feature_header}>
								<span>{String(index + 1).padStart(2, "0")}</span>
								<i><FontAwesome prefix="fad" name={feature.icon}/></i>
								<h3>{feature.title}</h3>
								<small>{displaySupporter ? labels.supporter : labels.free}</small>
							</div>
							<div className={styles.feature_stage}>
								<div className={styles.feature_media}
								     data-empty={!view.media}
								     data-blurred={view.media?.blurred ?? false}>
									{view.media?.type === "image" &&
										<Image src={view.media.src} alt={view.media.alt} draggable={false} fill sizes="(max-width: 760px) 94vw, 520px"/>}
									{view.media?.type === "video" &&
										<video key={view.media.src} src={view.media.src} aria-label={view.media.alt} autoPlay loop muted playsInline preload="metadata"/>}
								{!view.media && <span>
									<FontAwesome prefix="fad" name={isAvailable ? "circle-check" : "lock-keyhole"}/>
									{isAvailable ? labels.available : labels.unavailable}
								</span>}
								</div>
								<p>{view.body}</p>
							</div>
						</article>
					);
				})}
			</div>
		</>
	);
}
