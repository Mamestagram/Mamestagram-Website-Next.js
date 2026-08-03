"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { previewAboutMe, updateAboutMe } from "@/actions/profile";
import FontAwesome from "@/components/font-awesome";
import BBCodeImageErrorHandler from "@/components/profile/bbcode-image-error-handler";
import AboutMeEmptyState from "@/components/profile/about-me-empty-state";
import Tooltip from "@/components/tooltip";
import styles from "@s/profile.module.css";

const MAX_LENGTH = 10_000;
const BBCODE_TOOLS = [
	{ icon: "heading", title: "Heading", open: "[heading]", close: "[/heading]", placeholder: "Heading" },
	{ icon: "bold", title: "Bold", open: "[b]", close: "[/b]", placeholder: "bold text" },
	{ icon: "italic", title: "Italic", open: "[i]", close: "[/i]", placeholder: "italic text" },
	{ icon: "underline", title: "Underline", open: "[u]", close: "[/u]", placeholder: "underlined text" },
	{ icon: "strikethrough", title: "Strikethrough", open: "[s]", close: "[/s]", placeholder: "struck text" },
	{ icon: "palette", title: "Text color", open: "[color=#b465bd]", close: "[/color]", placeholder: "colored text" },
	{ icon: "text-height", title: "Text size", open: "[size=125]", close: "[/size]", placeholder: "sized text" },
	{ icon: "align-center", title: "Center", open: "[center]", close: "[/center]", placeholder: "centered text" },
	{ icon: "code", title: "Inline code", open: "[c]", close: "[/c]", placeholder: "code" },
	{ icon: "file-code", title: "Code block", open: "[code]\n", close: "\n[/code]", placeholder: "code" },
	{ icon: "quote-left", title: "Quote", open: "[quote=NAME]\n", close: "\n[/quote]", placeholder: "quoted text" },
	{ icon: "eye-slash", title: "Spoiler", open: "[spoiler]", close: "[/spoiler]", placeholder: "spoiler text" },
	{ icon: "box", title: "Spoiler box", open: "[box=TITLE]\n", close: "\n[/box]", placeholder: "box content" },
	{ icon: "list-ul", title: "List", open: "[list=disc]\n[*]", close: "\n[/list]", placeholder: "list item" },
	{ icon: "link", title: "Link", open: "[url=https://]", close: "[/url]", placeholder: "link text" },
	{ icon: "image", title: "Image", open: "[img]", close: "[/img]", placeholder: "https://" },
	{ icon: "user", title: "Profile link", open: "[profile=7]", close: "[/profile]", placeholder: "username" }
] as const;

export default function AboutMeEditor({ initialBBCode, initialHtml, profileId, isClan, mode }: Readonly<{
	initialBBCode: string,
	initialHtml: string,
	profileId: number,
	isClan: boolean,
	mode: string
}>) {
	const router = useRouter();
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const cancelNoButtonRef = useRef<HTMLButtonElement>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isPreviewing, setIsPreviewing] = useState(false);
	const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [content, setContent] = useState(initialBBCode);
	const [savedContent, setSavedContent] = useState(initialBBCode);
	const [renderedHtml, setRenderedHtml] = useState(initialHtml);
	const [previewHtml, setPreviewHtml] = useState("");
	const [status, setStatus] = useState<{ success: boolean, message: string } | null>(null);

	useEffect(() => {
		if (!isCancelConfirmOpen) return;
		const previousOverflow = document.body.style.overflow;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsCancelConfirmOpen(false);
		};
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", closeOnEscape);
		requestAnimationFrame(() => cancelNoButtonRef.current?.focus());
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isCancelConfirmOpen]);

	const insertBBCode = (open: string, close: string, placeholder: string) => {
		const textarea = textareaRef.current;
		const selectionStart = textarea?.selectionStart ?? content.length;
		const selectionEnd = textarea?.selectionEnd ?? selectionStart;
		const selectedText = content.slice(selectionStart, selectionEnd);
		const innerText = selectedText || placeholder;
		const replacement = `${open}${innerText}${close}`;
		const nextContent = `${content.slice(0, selectionStart)}${replacement}${content.slice(selectionEnd)}`;

		if (nextContent.length > MAX_LENGTH) {
			setStatus({ success: false, message: `About Me must be ${MAX_LENGTH.toLocaleString()} characters or fewer.` });
			return;
		}

		setContent(nextContent);
		setStatus(null);
		requestAnimationFrame(() => {
			if (!textareaRef.current) return;
			const innerStart = selectionStart + open.length;
			textareaRef.current.focus();
			textareaRef.current.setSelectionRange(innerStart, innerStart + innerText.length);
		});
	};

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		setStatus(null);

		startTransition(async () => {
			const result = await updateAboutMe(formData);
			setStatus({ success: result.success, message: result.message });
			if (!result.success) return;

			setContent(result.content ?? "");
			setSavedContent(result.content ?? "");
			setRenderedHtml(result.html ?? "");
			setIsEditing(false);
			router.refresh();
		});
	};

	const discardChanges = () => {
		setContent(savedContent);
		setStatus(null);
		setIsPreviewing(false);
		setIsEditing(false);
	};
	const cancelEditing = () => {
		if (content !== savedContent) {
			setIsCancelConfirmOpen(true);
			return;
		}
		discardChanges();
	};

	const togglePreview = () => {
		if (isPreviewing) {
			setIsPreviewing(false);
			setStatus(null);
			requestAnimationFrame(() => textareaRef.current?.focus());
			return;
		}

		setStatus(null);
		startTransition(async () => {
			const result = await previewAboutMe(content);
			if (!result.success) {
				setStatus({ success: false, message: result.message });
				return;
			}

			setPreviewHtml(result.html ?? "");
			setIsPreviewing(true);
		});
	};

	return (
		<>
			<div className={styles.about_me_header}>
				<h1 className={styles.section_title}>
					<FontAwesome prefix="fad" name="id-badge"/>
					About Me
				</h1>
				{!isEditing && (
					<button className={styles.edit_about_me}
					        type="button"
					        onClick={() => {
						        setStatus(null);
						        setIsPreviewing(false);
						        setIsEditing(true);
					        }}>
						<FontAwesome prefix="fas" name="pen"/>
						Edit
					</button>
				)}
			</div>

			{isEditing ? (
				<form className={styles.about_me_editor} onSubmit={submit}>
					<input type="hidden" name="mode" value={mode}/>
					<input type="hidden" name="profileId" value={profileId}/>
					<input type="hidden" name="profileType" value={isClan ? "clan" : "user"}/>
					{isPreviewing ? (
						<>
							<input type="hidden" name="content" value={content}/>
							<div className={`${styles.userpage_content} ${styles.editor_preview}`}
							     data-empty={!previewHtml}
							     dangerouslySetInnerHTML={{ __html: previewHtml || "No profile description yet." }}/>
							<BBCodeImageErrorHandler key={previewHtml}/>
						</>
					) : (
						<>
							<textarea id="about-me-content"
							          ref={textareaRef}
							          name="content"
							          aria-label="About Me"
							          value={content}
							          maxLength={MAX_LENGTH}
							          rows={12}
							          onChange={(event) => setContent(event.target.value)}
							          disabled={isPending}
							          autoFocus/>
							<div className={styles.bbcode_toolbar} role="toolbar" aria-label="BBCode formatting">
								{BBCODE_TOOLS.map((tool) => (
									<Tooltip key={tool.title}
									         className={styles.bbcode_tooltip}
									         bubble
									         description={tool.title}>
										<button type="button"
										        aria-label={tool.title}
										        disabled={isPending}
										        onMouseDown={(event) => event.preventDefault()}
										        onClick={() => insertBBCode(tool.open, tool.close, tool.placeholder)}>
											<FontAwesome prefix="fas" name={tool.icon}/>
										</button>
									</Tooltip>
								))}
								<a className={styles.bbcode_help}
								   href="https://github.com/Mamestagram/BBCode-Usage"
								   target="_blank"
								   rel="noopener noreferrer">
									<FontAwesome prefix="fas" name="circle-question"/>
									Help
								</a>
							</div>
						</>
					)}
					<div className={styles.editor_footer}>
						<span>{content.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}</span>
						<div className={styles.editor_actions}>
							<button type="button"
							        onClick={cancelEditing}
							        disabled={isPending}>
								Cancel
							</button>
							<button className={styles.save_about_me}
							        type="button"
							        onClick={togglePreview}
							        disabled={isPending}>
								{isPending ? "Loading…" : isPreviewing ? "Back to edit" : "Preview"}
							</button>
							<button className={styles.save_about_me} type="submit" disabled={isPending}>
								{isPending ? "Saving…" : "Save"}
							</button>
						</div>
					</div>
				</form>
			) : (
				renderedHtml.trim() ? (
					<>
						<div className={styles.userpage_content} dangerouslySetInnerHTML={{ __html: renderedHtml }}/>
						<BBCodeImageErrorHandler key={renderedHtml}/>
					</>
				) : <AboutMeEmptyState canEdit/>
			)}

			{status && (
				<p className={styles.editor_status} data-success={status.success} role="status">
					{status.message}
				</p>
			)}

			{isCancelConfirmOpen && createPortal(
				<div className={styles.clan_kick_overlay}
				     onMouseDown={(event) => {
					     if (event.target === event.currentTarget) setIsCancelConfirmOpen(false);
				     }}>
					<section className={styles.clan_kick_dialog}
					         role="alertdialog"
					         aria-modal="true"
					         aria-labelledby="discard-about-me-title">
						<span className={styles.clan_kick_icon}>
							<FontAwesome prefix="fad" name="triangle-exclamation"/>
						</span>
						<h2 id="discard-about-me-title">Discard unsaved changes?</h2>
						<p>Unsaved changes will be lost. Are you sure?</p>
						<div className={styles.clan_kick_actions}>
							<button ref={cancelNoButtonRef}
							        type="button"
							        onClick={() => setIsCancelConfirmOpen(false)}>
								No
							</button>
							<button type="button"
							        className={styles.confirm_kick}
							        onClick={() => {
								        setIsCancelConfirmOpen(false);
								        discardChanges();
							        }}>
								Yes
							</button>
						</div>
					</section>
				</div>,
				document.body
			)}
		</>
	);
}
