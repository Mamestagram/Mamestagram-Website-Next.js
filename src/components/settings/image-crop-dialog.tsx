"use client";

import Image from "next/image";
import {
	useEffect,
	useId,
	useRef,
	useState,
	useSyncExternalStore,
	type CSSProperties,
	type KeyboardEvent,
	type PointerEvent
} from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/image-crop-dialog.module.css";

export type ImageCropType = "avatar" | "banner" | "background";

type Size = {
	width: number,
	height: number
};

type Position = {
	x: number,
	y: number
};

type DragState = {
	pointerId: number,
	clientX: number,
	clientY: number,
	position: Position
};

type CropConfig = {
	label: string,
	ratioLabel: string,
	output: Size
};

type CropOutputFormat = {
	extension: "jpg" | "jpeg" | "png" | "webp",
	mimeType: "image/jpeg" | "image/png" | "image/webp",
	quality?: number
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;

const cropConfig: Record<ImageCropType, CropConfig> = {
	avatar: {
		label: "avatar",
		ratioLabel: "1:1",
		output: { width: 512, height: 512 }
	},
	banner: {
		label: "banner",
		ratioLabel: "16:5",
		output: { width: 1600, height: 500 }
	},
	background: {
		label: "background",
		ratioLabel: "16:9",
		output: { width: 1920, height: 1080 }
	}
};

const subscribeToClient = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const getBaseScale = (frame: Size, image: Size) => {
	if (!frame.width || !frame.height || !image.width || !image.height) return 0;
	return Math.max(frame.width / image.width, frame.height / image.height);
};

const clampPosition = (position: Position, frame: Size, image: Size, zoom: number): Position => {
	const baseScale = getBaseScale(frame, image);
	if (!baseScale) return { x: 0, y: 0 };
	const maxX = Math.max(0, (image.width * baseScale * zoom - frame.width) / 2);
	const maxY = Math.max(0, (image.height * baseScale * zoom - frame.height) / 2);
	return {
		x: Math.min(maxX, Math.max(-maxX, position.x)),
		y: Math.min(maxY, Math.max(-maxY, position.y))
	};
};

const getCropOutputFormat = (sourceName: string): CropOutputFormat => {
	const extension = sourceName.split(".").pop()?.toLowerCase();
	if (extension === "jpg" || extension === "jpeg")
		return { extension, mimeType: "image/jpeg", quality: .92 };
	if (extension === "png") return { extension, mimeType: "image/png" };
	if (extension === "webp")
		return { extension, mimeType: "image/webp", quality: .92 };
	throw new Error("The original image format could not be preserved.");
};

const exportCanvas = (canvas: HTMLCanvasElement, format: CropOutputFormat) =>
	new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob || blob.type !== format.mimeType) {
				reject(new Error("The cropped image could not be created in its original format."));
				return;
			}
			resolve(blob);
		}, format.mimeType, format.quality);
	});

const getOutputName = (
	sourceName: string,
	mediaType: ImageCropType,
	extension: CropOutputFormat["extension"]
) => {
	const stem = sourceName.replace(/\.[^.]+$/, "") || "image";
	return `${stem}-${mediaType}.${extension}`;
};

export default function ImageCropDialog({
	sourceUrl,
	sourceName,
	mediaType,
	onCancel,
	onApply
}: Readonly<{
	sourceUrl: string,
	sourceName: string,
	mediaType: ImageCropType,
	onCancel: () => void,
	onApply: (file: File) => void
}>) {
	const isClient = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);
	const titleId = useId();
	const descriptionId = useId();
	const frameRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const dragRef = useRef<DragState | null>(null);
	const onCancelRef = useRef(onCancel);
	const isProcessingRef = useRef(false);
	const [frameSize, setFrameSize] = useState<Size>({ width: 0, height: 0 });
	const [imageSize, setImageSize] = useState<Size>({ width: 0, height: 0 });
	const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(MIN_ZOOM);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState("");
	const config = cropConfig[mediaType];
	const baseScale = getBaseScale(frameSize, imageSize);
	const safePosition = clampPosition(position, frameSize, imageSize, zoom);
	const isReady = Boolean(baseScale && imageSize.width && imageSize.height);
	const outputFormat = getCropOutputFormat(sourceName);
	const imageStyle: CSSProperties = {
		left: `calc(50% + ${safePosition.x}px)`,
		top: `calc(50% + ${safePosition.y}px)`,
		width: imageSize.width * baseScale,
		height: imageSize.height * baseScale,
		opacity: isReady ? 1 : 0,
		transform: `translate(-50%, -50%) scale(${zoom})`
	};

	useEffect(() => {
		onCancelRef.current = onCancel;
	}, [onCancel]);

	useEffect(() => {
		isProcessingRef.current = isProcessing;
	}, [isProcessing]);

	useEffect(() => {
		if (!isClient) return;
		const frame = frameRef.current;
		if (!frame) return;
		const observer = new ResizeObserver(([entry]) => {
			if (!entry) return;
			setFrameSize({
				width: entry.contentRect.width,
				height: entry.contentRect.height
			});
		});
		observer.observe(frame);
		return () => observer.disconnect();
	}, [isClient]);

	useEffect(() => {
		if (!isClient) return;
		const previousOverflow = document.body.style.overflow;
		const closeOnEscape = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape" && !isProcessingRef.current) onCancelRef.current();
		};
		const focusFrame = requestAnimationFrame(() => frameRef.current?.focus());
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			cancelAnimationFrame(focusFrame);
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isClient]);

	const updateZoom = (value: number) => {
		const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
		setZoom(nextZoom);
		setPosition((current) => clampPosition(current, frameSize, imageSize, nextZoom));
	};

	const startDragging = (event: PointerEvent<HTMLDivElement>) => {
		if (!isReady || isProcessing) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		dragRef.current = {
			pointerId: event.pointerId,
			clientX: event.clientX,
			clientY: event.clientY,
			position: safePosition
		};
	};

	const dragImage = (event: PointerEvent<HTMLDivElement>) => {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;
		setPosition(clampPosition({
			x: drag.position.x + event.clientX - drag.clientX,
			y: drag.position.y + event.clientY - drag.clientY
		}, frameSize, imageSize, zoom));
	};

	const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
		if (dragRef.current?.pointerId !== event.pointerId) return;
		if (event.currentTarget.hasPointerCapture(event.pointerId))
			event.currentTarget.releasePointerCapture(event.pointerId);
		dragRef.current = null;
	};

	const moveWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
		const directions: Partial<Record<string, Position>> = {
			ArrowUp: { x: 0, y: -1 },
			ArrowDown: { x: 0, y: 1 },
			ArrowLeft: { x: -1, y: 0 },
			ArrowRight: { x: 1, y: 0 }
		};
		const direction = directions[event.key];
		if (!direction || !isReady || isProcessing) return;
		event.preventDefault();
		const distance = event.shiftKey ? 10 : 2;
		setPosition(clampPosition({
			x: safePosition.x + direction.x * distance,
			y: safePosition.y + direction.y * distance
		}, frameSize, imageSize, zoom));
	};

	const applyCrop = async () => {
		const image = imageRef.current;
		if (!image || !isReady || isProcessing) return;
		setError("");
		setIsProcessing(true);
		try {
			const effectiveScale = baseScale * zoom;
			const sourceWidth = frameSize.width / effectiveScale;
			const sourceHeight = frameSize.height / effectiveScale;
			const sourceX = Math.max(0, Math.min(
				imageSize.width - sourceWidth,
				imageSize.width / 2 - safePosition.x / effectiveScale - sourceWidth / 2
			));
			const sourceY = Math.max(0, Math.min(
				imageSize.height - sourceHeight,
				imageSize.height / 2 - safePosition.y / effectiveScale - sourceHeight / 2
			));
			const canvas = document.createElement("canvas");
			canvas.width = config.output.width;
			canvas.height = config.output.height;
			const context = canvas.getContext("2d");
			if (!context) {
				setError("The cropped image could not be created.");
				return;
			}
			context.imageSmoothingEnabled = true;
			context.imageSmoothingQuality = "high";
			context.drawImage(
				image,
				sourceX,
				sourceY,
				sourceWidth,
				sourceHeight,
				0,
				0,
				config.output.width,
				config.output.height
			);
			const blob = await exportCanvas(canvas, outputFormat);
			if (blob.size > MAX_OUTPUT_BYTES) {
				setError("The cropped image is larger than 5 MB. Try a smaller zoom area.");
				return;
			}
			onApply(new File(
				[blob],
				getOutputName(sourceName, mediaType, outputFormat.extension),
				{ type: blob.type, lastModified: Date.now() }
			));
		}
		catch (cropError: unknown) {
			setError(cropError instanceof Error ? cropError.message : "The cropped image could not be created.");
		}
		finally {
			setIsProcessing(false);
		}
	};

	if (!isClient) return null;

	return createPortal(
		<div className={styles.overlay}
		     onMouseDown={(event) => {
			     if (event.target === event.currentTarget && !isProcessing) onCancel();
		     }}>
			<section className={styles.dialog}
			         role="dialog"
			         aria-modal="true"
			         aria-labelledby={titleId}
			         aria-describedby={descriptionId}
			         data-processing={isProcessing}>
				<header className={styles.header}>
					<span className={styles.header_icon}><FontAwesome prefix="fad" name="images"/></span>
					<div>
						<small>{config.ratioLabel} CROP</small>
						<h2 id={titleId}>Crop {config.label}</h2>
					</div>
					<button type="button"
					        aria-label="Close crop editor"
					        disabled={isProcessing}
					        onClick={onCancel}>
						<FontAwesome prefix="fas" name="xmark"/>
					</button>
				</header>

				<p id={descriptionId} className={styles.instructions}>
					Drag the image to reposition it, then use the slider to zoom.
				</p>

				<div ref={frameRef}
				     className={styles.crop_frame}
				     data-media={mediaType}
				     tabIndex={0}
				     aria-label={`Crop ${config.label}. Use arrow keys to reposition the image.`}
				     onPointerDown={startDragging}
				     onPointerMove={dragImage}
				     onPointerUp={stopDragging}
				     onPointerCancel={stopDragging}
				     onKeyDown={moveWithKeyboard}>
					<Image ref={imageRef}
					       className={styles.crop_image}
					       src={sourceUrl}
					       alt="Image being cropped"
					       width={Math.max(1, imageSize.width)}
					       height={Math.max(1, imageSize.height)}
					       style={imageStyle}
					       unoptimized
					       draggable={false}
					       onLoad={(event) => {
						       setImageSize({
							       width: event.currentTarget.naturalWidth,
							       height: event.currentTarget.naturalHeight
						       });
						       setError("");
					       }}
					       onError={() => setError("The selected image could not be opened.")}/>
					{!isReady && <span className={styles.loading}>Preparing image…</span>}
				</div>

				<div className={styles.zoom_control}>
					<span><FontAwesome prefix="fas" name="magnifying-glass"/> Zoom</span>
					<button type="button"
					        aria-label="Zoom out"
					        disabled={isProcessing || zoom <= MIN_ZOOM}
					        onClick={() => updateZoom(zoom - .1)}>−</button>
					<input type="range"
					       min={MIN_ZOOM}
					       max={MAX_ZOOM}
					       step="0.01"
					       value={zoom}
					       aria-label="Crop zoom"
					       disabled={isProcessing}
					       onChange={(event) => updateZoom(Number(event.currentTarget.value))}/>
					<button type="button"
					        aria-label="Zoom in"
					        disabled={isProcessing || zoom >= MAX_ZOOM}
					        onClick={() => updateZoom(zoom + .1)}>+</button>
					<output>{Math.round(zoom * 100)}%</output>
				</div>

				<div className={styles.output_info}>
					<FontAwesome prefix="fas" name="image"/>
					Output: {config.output.width} × {config.output.height} {outputFormat.extension.toUpperCase()}
				</div>
				{error && <p className={styles.error} role="alert">{error}</p>}

				<footer className={styles.actions}>
					<button type="button" disabled={isProcessing} onClick={onCancel}>Cancel</button>
					<button type="button"
					        className={styles.apply}
					        disabled={isProcessing || !isReady}
					        onClick={applyCrop}>
						<FontAwesome prefix="fas" name={isProcessing ? "spinner" : "check"}/>
						{isProcessing ? "Cropping…" : "Use crop"}
					</button>
				</footer>
			</section>
		</div>,
		document.body
	);
}
