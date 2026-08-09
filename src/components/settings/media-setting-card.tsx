"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "@/components/confirmation-dialog";
import FontAwesome from "@/components/font-awesome";
import { readMutationResponse } from "@/lib/mutation-response";
import styles from "@s/settings.module.css";

type MediaType = "avatar" | "banner" | "background";
type MediaScope = "profile" | "clan";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const supportedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

const mediaMeta: Record<MediaType, {
	label: string,
	description: string,
	icon: string
}> = {
	avatar: {
		label: "Avatar",
		description: "Shown beside your name across Mamestagram.",
		icon: "user"
	},
	banner: {
		label: "Profile banner",
		description: "A wide image displayed at the top of your profile.",
		icon: "image-landscape"
	},
	background: {
		label: "Profile background",
		description: "Sets the atmosphere behind your profile content.",
		icon: "mountains"
	}
};

const clanMediaMeta: Record<MediaType, {
	label: string,
	description: string
}> = {
	avatar: {
		label: "Clan avatar",
		description: "Shown beside the clan tag across Mamestagram."
	},
	banner: {
		label: "Clan banner",
		description: "A wide image displayed at the top of the clan profile."
	},
	background: {
		label: "Clan background",
		description: "Sets the atmosphere behind the clan profile content."
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

	useEffect(() => () => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
	}, [previewUrl]);

	const selectFile = (file: File | undefined) => {
		setStatus(null);
		if (!file) {
			setSelectedFile(null);
			setPreviewUrl("");
			return;
		}
		if (file.size > MAX_FILE_BYTES) {
			setSelectedFile(null);
			setPreviewUrl("");
			setStatus({ success: false, message: "The image must be 5 MB or smaller." });
			return;
		}
		if (file.type && !supportedTypes.has(file.type)) {
			setSelectedFile(null);
			setPreviewUrl("");
			setStatus({ success: false, message: "Use a PNG, JPG, WebP, or GIF image." });
			return;
		}

		setSelectedFile(file);
		setPreviewUrl(URL.createObjectURL(file));
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

				setSelectedFile(null);
				setPreviewUrl("");
				setCurrentImageUrl(`${imageUrl}?v=${Date.now()}`);
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
				setSelectedFile(null);
				setPreviewUrl("");
				setCurrentImageUrl(`${imageUrl}?v=${Date.now()}`);
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
					<p>{meta.description}</p>
				</div>
			</div>

			<div className={styles.media_preview} data-media={type} data-unavailable={isImageUnavailable}>
				{!isImageUnavailable
					? <Image src={previewUrl || currentImageUrl}
					         alt={`${meta.label} preview`}
					         fill
					         unoptimized
					         sizes={type === "avatar" ? "180px" : "(max-width: 760px) 100vw, 520px"}
					         onError={() => setIsImageUnavailable(true)}/>
					: <span className={styles.media_placeholder}>
						<FontAwesome prefix="fad" name={meta.icon}/>
						No custom {type}
					</span>}
			</div>

			<div className={styles.media_controls}>
				<label className={styles.file_picker}>
					<FontAwesome prefix="fas" name="folder-open"/>
					<span>{selectedFile?.name || "Choose image"}</span>
					<input ref={inputRef}
					       type="file"
					       accept=".png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif"
					       disabled={isPending}
					       onChange={(event) => selectFile(event.target.files?.item(0) ?? undefined)}/>
				</label>
				<div className={styles.media_actions}>
					<button type="button"
					        className={styles.secondary_button}
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
			<p className={styles.media_note}>PNG, JPG, WebP, or GIF · 5 MB maximum</p>
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
		</article>
	);
}
