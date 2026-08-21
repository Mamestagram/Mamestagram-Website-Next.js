"use client";

import { useEffect, useRef } from "react";

export default function BBCodeImageErrorHandler() {
	const markerRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const container = markerRef.current?.previousElementSibling;
		if (!(container instanceof HTMLElement)) return;

		const cleanups: (() => void)[] = [];
		const images = container.querySelectorAll<HTMLImageElement>("img[data-bbcode-image]");

		images.forEach((image) => {
			const showError = () => {
				image.style.display = "none";
				const error = image.nextElementSibling;
				if (error instanceof HTMLElement) error.style.display = "inline-flex";
			};

			if (image.complete && image.naturalWidth === 0) showError();

			image.addEventListener("error", showError);
			cleanups.push(() => image.removeEventListener("error", showError));
		});

		return () => cleanups.forEach((cleanup) => cleanup());
	}, []);

	return <span ref={markerRef} hidden/>;
}
