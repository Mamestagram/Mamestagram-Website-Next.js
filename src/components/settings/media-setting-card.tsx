"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "@/components/confirmation-dialog";
import FontAwesome from "@/components/font-awesome";
import ImageCropDialog, { type ImageCropType } from "@/components/settings/image-crop-dialog";
import { readMutationResponse } from "@/lib/mutation-response";
import styles from "@s/settings.module.css";

type MediaType = ImageCropType;
type MediaScope = "profile" | "clan";
type CropSource = {
	file: File,
	url: string
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const supportedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const supportedExtensions = new Set(["png", "jpg", "jpeg", "webp", "gif"]);
const getFileExtension = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "";
const isGifFile = (file: File) =>
	file.type === "image/gif" || getFileExtension(file) === "gif";

const getVersionedImageUrl = (imageUrl: string) => {
	const url = new URL(imageUrl, window.location.origin);
	url.searchParams.set("v", Date.now().toString());
	return imageUrl.startsWith("/") ? `${url.pathname}${url.search}` : url.toString();
};

const mediaMeta: Record<MediaType, {
	label: string,
	description?: string,
	icon: string
}> = {
	avatar: {
		label: "Avatar",
		icon: "user"
	},
	banner: {
		label: "Profile banner",
		icon: "image-landscape"
	},
	background: {
		label: "Profile background",
		icon: "mountains"
	}
};

const clanMediaMeta: Record<MediaType, {
	label: string
}> = {
	avatar: {
		label: "Clan avatar"
	},
	banner: {
		label: "Clan banner"
	},
	background: {
		label: "Clan background"
	}
};

export default function MediaSettingCard({ type, imageUrl, hasCustomImage, scope = "profile" }: Readonly<{
	type: MediaType,
	imageUrl: string,
	hasCustomImage: boolean,
	scope?: MediaScope
}>) {
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedSourceFile, setSelectedSourceFile] = useState<File | null>(null);
	const [cropSource, setCropSource] = useState<CropSource | null>(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
	const [isCustomImage, setIsCustomImage] = useState(hasCustomImage);
	const [isImageUnavailable, setIsImageUnavailable] = useState(false);
	const [isResetOpen, setIsResetOpen] = useState(false);
	const [resetError, setResetError] = useState("");
	const [operation, setOperation] = useState<"upload" | "reset" | null>(null);
	const [status, setStatus] = useState<{ success: boolean, message: string } | null>(null);
	const [isPending, startTransition] = useTransition();
	const meta = scope === "clan"
		? { ...mediaMeta[type], ...clanMediaMeta[type] }
		: mediaMeta[type];
	const endpoint = `/api/settings/media/${type}${scope === "clan" ? "?scope=clan" : ""}`;
	const displayedImageUrl = previewUrl || (isCustomImage ? currentImageUrl : "");

	useEffect(() => () => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
	}, [previewUrl]);

	useEffect(() => () => {
		if (cropSource) URL.revokeObjectURL(cropSource.url);
	}, [cropSource]);

	const clearSelectedFile = () => {
		setSelectedFile(null);
		setSelectedSourceFile(null);
		setPreviewUrl("");
	};

	const openCropper = (file: File) => {
		setCropSource({ file, url: URL.createObjectURL(file) });
	};

	const selectFile = (file: File | undefined) => {
		setStatus(null);
		if (!file) return;
		if (file.size > MAX_FILE_BYTES) {
			clearSelectedFile();
			setStatus({ success: false, message: "The image must be 5 MB or smaller." });
			return;
		}
		if (!supportedExtensions.has(getFileExtension(file)) ||
			(file.type && !supportedTypes.has(file.type))) {
			clearSelectedFile();
			setStatus({ success: false, message: "Use a PNG, JPG, WebP, or GIF image." });
			return;
		}

		if (isGifFile(file)) {
			setSelectedSourceFile(file);
			setSelectedFile(file);
			setPreviewUrl(URL.createObjectURL(file));
			setCropSource(null);
			setIsImageUnavailable(false);
			return;
		}

		openCropper(file);
	};

	const applyCrop = (file: File) => {
		if (!cropSource) return;
		setSelectedSourceFile(cropSource.file);
		setSelectedFile(file);
		setPreviewUrl(URL.createObjectURL(file));
		setCropSource(null);
		setIsImageUnavailable(false);
	};

	const upload = () => {
		if (!selectedFile) return;
		setStatus(null);
		setOperation("upload");
		startTransition(async () => {
			try {
				const formData = new FormData();
				formData.set("image", selectedFile);
				const response = await fetch(endpoint, { method: "POST", body: formData });
				const result = await readMutationResponse(response);
				setStatus(result);
				if (!result.success) return;

				clearSelectedFile();
				setCurrentImageUrl(getVersionedImageUrl(imageUrl));
				setIsCustomImage(true);
				if (inputRef.current) inputRef.current.value = "";
				router.refresh();
			}
			catch {
				setStatus({ success: false, message: `${meta.label} could not be updated.` });
			}
			finally {
				setOperation(null);
			}
		});
	};

	const reset = () => {
		setResetError("");
		setOperation("reset");
		startTransition(async () => {
			try {
				const response = await fetch(endpoint, { method: "DELETE" });
				const result = await readMutationResponse(response);
				if (!result.success) {
					setResetError(result.message);
					return;
				}

				setStatus(result);
				setIsResetOpen(false);
				setIsCustomImage(false);
				clearSelectedFile();
				setCurrentImageUrl(getVersionedImageUrl(imageUrl));
				if (inputRef.current) inputRef.current.value = "";
				router.refresh();
			}
			catch {
				setResetError(`${meta.label} could not be reset.`);
			}
			finally {
				setOperation(null);
			}
		});
	};

	return (
		<article className={styles.media_card} data-media={type}>
			<div className={styles.media_heading}>
				<span><FontAwesome prefix="fad" name={meta.icon}/></span>
				<div>
					<h3>{meta.label}</h3>
					{meta.description && <p>{meta.description}</p>}
				</div>
			</div>

			<div className={styles.media_preview} data-media={type} data-unavailable={isImageUnavailable}>
				{displayedImageUrl && !isImageUnavailable
					? <>
						<Image src={displayedImageUrl}
						       alt={`${meta.label} preview`}
						       fill
						       unoptimized
						       draggable={false}
						       sizes={type === "avatar" ? "180px" : "(max-width: 760px) 100vw, 520px"}
						       loading={type === "banner" ? "eager" : undefined}
						       onError={() => setIsImageUnavailable(true)}/>
						{previewUrl && <span className={styles.media_preview_badge}>
							<FontAwesome prefix="fas" name="eye"/>
							Preview
						</span>}
					</>
					: <span className={styles.media_placeholder}>
						<FontAwesome prefix="fad" name={meta.icon}/>
						<span>{type === "avatar" ? <>No custom<br/>avatar</> : `No custom ${type}`}</span>
					</span>}
			</div>

			<div className={styles.media_controls}>
				<label className={styles.file_picker}>
					<FontAwesome prefix="fas" name="folder-open"/>
					<span>{selectedSourceFile?.name || "Choose image"}</span>
					<input ref={inputRef}
					       type="file"
					       accept=".png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif"
					       disabled={isPending}
					       onChange={(event) => {
						       const file = event.currentTarget.files?.item(0) ?? undefined;
						       event.currentTarget.value = "";
						       selectFile(file);
					       }}/>
				</label>
				<div className={styles.media_actions}>
					<button type="button"
					        className={styles.secondary_button}
					        disabled={isPending || !selectedSourceFile || isGifFile(selectedSourceFile)}
					        onClick={() => {
						        if (selectedSourceFile) openCropper(selectedSourceFile);
					        }}>
						<FontAwesome prefix="fas" name="sliders"/>
						Crop
					</button>
					<button type="button"
					        className={styles.danger_button}
					        disabled={isPending || !isCustomImage}
					        onClick={() => {
						        setResetError("");
						        setIsResetOpen(true);
					        }}>
						<FontAwesome prefix="fas" name="rotate-left"/>
						Reset
					</button>
					<button type="button"
					        className={styles.primary_button}
					        disabled={isPending || !selectedFile}
					        onClick={upload}>
						<FontAwesome className={isPending && operation === "upload" ? styles.spinner : undefined}
						             prefix="fas"
						             name={isPending && operation === "upload" ? "spinner" : "upload"}/>
						{isPending && operation === "upload" ? "Uploading…" : "Upload"}
					</button>
				</div>
			</div>
			<p className={styles.media_note}>PNG, JPG, WebP, or GIF · 5 MB maximum · Original format preserved · GIF is not cropped</p>
			{status && <p className={styles.status} data-success={status.success} role="status">{status.message}</p>}

			<ConfirmationDialog isOpen={isResetOpen}
			                    title={`Reset ${meta.label.toLowerCase()}?`}
			                    description={`Your custom ${meta.label.toLowerCase()} will be removed.`}
			                    icon="rotate-left"
			                    pendingLabel="Resetting…"
			                    isPending={isPending && operation === "reset"}
			                    error={resetError}
			                    onCancel={() => setIsResetOpen(false)}
			                    onConfirm={reset}/>
			{cropSource &&
				<ImageCropDialog sourceUrl={cropSource.url}
				                 sourceName={cropSource.file.name}
				                 mediaType={type}
				                 onCancel={() => setCropSource(null)}
				                 onApply={applyCrop}/>}
		</article>
	);
}
