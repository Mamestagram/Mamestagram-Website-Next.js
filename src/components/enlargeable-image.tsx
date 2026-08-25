"use client";

import Image from "next/image";
import { useEffect, useId, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/enlargeable-image.module.css";

export default function EnlargeableImage({
	src,
	alt,
	width,
	height,
	sizes
}: Readonly<{
	src: string,
	alt: string,
	width: number,
	height: number,
	sizes: string
}>) {
	const [isOpen, setIsOpen] = useState(false);
	const titleId = useId();
	const lightboxImageStyle = {
		"--image-ratio": width / height
	} as CSSProperties;
	
	useEffect(() => {
		if (!isOpen) return;
		const previousOverflow = document.body.style.overflow;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsOpen(false);
		};
		
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isOpen]);
	
	return (
		<>
			<button type="button"
			        className={styles.thumbnail}
			        aria-label={`Enlarge image: ${alt}`}
			        onClick={() => setIsOpen(true)}>
				<Image src={src}
				       alt={alt}
				       width={width}
				       height={height}
				       sizes={sizes}
				       draggable={false}/>
				<span aria-hidden="true"><FontAwesome prefix="fas" name="magnifying-glass-plus"/></span>
			</button>
			{isOpen && createPortal(
				<div className={styles.lightbox}
				     role="dialog"
				     aria-modal="true"
				     aria-labelledby={titleId}
				     onPointerDown={() => setIsOpen(false)}>
					<span id={titleId} className={styles.title}>{alt}</span>
					<button type="button"
					        className={styles.close}
					        aria-label="Close enlarged image"
					        onClick={() => setIsOpen(false)}>
						<FontAwesome prefix="fas" name="xmark"/>
					</button>
					<div className={styles.content}
					     style={lightboxImageStyle}
					     onPointerDown={(event) => event.stopPropagation()}>
						<Image src={src}
						       alt=""
						       fill
						       sizes="100vw"
						       draggable={false}/>
					</div>
				</div>,
				document.body
			)}
		</>
	);
}
