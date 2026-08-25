"use client";

import { useRef, useState, useTransition } from "react";
import type { SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { previewAboutMe, updateAboutMe, type AboutMeUpdateResult } from "@/actions/profile";
import ConfirmationDialog from "@/components/confirmation-dialog";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import BBCodeImageErrorHandler from "@/components/profile/bbcode-image-error-handler";
import AboutMeEmptyState from "@/components/profile/about-me-empty-state";
import Tooltip from "@/components/tooltip";
import { MAX_ABOUT_ME_LENGTH, normalizeAboutMe } from "@/lib/about-me";
import styles from "@s/profile.module.css";

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

const isAboutMeUpdateResult = (value: unknown): value is AboutMeUpdateResult => {
	if (typeof value !== "object" || value === null) return false;
	const result = value as Record<string, unknown>;
	return typeof result.success === "boolean" && typeof result.message === "string" &&
		(result.content === undefined || typeof result.content === "string") &&
		(result.html === undefined || typeof result.html === "string");
};

const readAboutMeResponse = async (response: Response): Promise<AboutMeUpdateResult> => {
	try {
		const body: unknown = await response.json();
		if (isAboutMeUpdateResult(body)) return body;
	} catch {
		// The fallback below is used when the response is not JSON.
	}
	return { success: false, message: "The server returned an unexpected response." };
};

export default function AboutMeEditor({
	initialBBCode,
	initialHtml,
	profileId,
	isClan,
	mode,
	alwaysEditing = false,
	settingsEndpoint
}: Readonly<{
	initialBBCode: string,
	initialHtml: string,
	profileId: number,
	isClan: boolean,
	mode: string,
	alwaysEditing?: boolean,
	settingsEndpoint?: string
}>) {
	const router = useRouter();
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [isEditing, setIsEditing] = useState(alwaysEditing);
	const [isPreviewing, setIsPreviewing] = useState(false);
	const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [content, setContent] = useState(initialBBCode);
	const [savedContent, setSavedContent] = useState(initialBBCode);
	const [renderedHtml, setRenderedHtml] = useState(initialHtml);
	const [previewHtml, setPreviewHtml] = useState("");
	const [status, setStatus] = useState<{ success: boolean, message: string } | null>(null);
	const hasChanges = content !== savedContent;
	
	const insertBBCode = (open: string, close: string, placeholder: string) => {
		const textarea = textareaRef.current;
		const selectionStart = textarea?.selectionStart ?? content.length;
		const selectionEnd = textarea?.selectionEnd ?? selectionStart;
		const selectedText = content.slice(selectionStart, selectionEnd);
		const innerText = selectedText || placeholder;
		const replacement = `${open}${innerText}${close}`;
		const nextContent = `${content.slice(0, selectionStart)}${replacement}${content.slice(selectionEnd)}`;
		
		if (nextContent.length > MAX_ABOUT_ME_LENGTH) {
			setStatus({
				success: false,
				message: `About Me must be ${MAX_ABOUT_ME_LENGTH.toLocaleString()} characters or fewer.`
			});
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
	
	const submit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		setStatus(null);
		
		startTransition(async () => {
			try {
				const result = settingsEndpoint
					? await readAboutMeResponse(await fetch(settingsEndpoint, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ content })
					}))
					: await updateAboutMe(formData);
				setStatus({ success: result.success, message: result.message });
				if (!result.success) return;
				
				const saved = result.content ?? normalizeAboutMe(content);
				setContent(saved);
				setSavedContent(saved);
				setRenderedHtml(result.html ?? "");
				setIsPreviewing(false);
				if (!alwaysEditing) setIsEditing(false);
				router.refresh();
			} catch {
				setStatus({ success: false, message: "About Me could not be updated." });
			}
		});
	};
	
	const discardChanges = () => {
		setContent(savedContent);
		setStatus(null);
		setIsPreviewing(false);
		if (!alwaysEditing) setIsEditing(false);
	};
	const cancelEditing = () => {
		if (hasChanges) {
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
			try {
				const result = settingsEndpoint
					? await readAboutMeResponse(await fetch(settingsEndpoint, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ content })
					}))
					: await previewAboutMe(content);
				if (!result.success) {
					setStatus({ success: false, message: result.message });
					return;
				}
				
				setPreviewHtml(result.html ?? "");
				setIsPreviewing(true);
			} catch {
				setStatus({ success: false, message: "About Me preview could not be generated." });
			}
		});
	};
	
	return (
		<>
			{!alwaysEditing && <div className={styles.about_me_header}>
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
			</div>}
			
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
							          maxLength={MAX_ABOUT_ME_LENGTH}
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
								<Link className={styles.bbcode_help} href="/documents#bbcode">
									<FontAwesome prefix="fas" name="circle-question"/>
									Help
								</Link>
							</div>
						</>
					)}
					<div className={styles.editor_footer}>
						<span><FormattedNumber value={content.length}/> / <FormattedNumber value={MAX_ABOUT_ME_LENGTH}/></span>
						<div className={styles.editor_actions}>
							<button type="button"
							        onClick={cancelEditing}
							        disabled={isPending || (alwaysEditing && !hasChanges)}>
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
			
			<ConfirmationDialog isOpen={isCancelConfirmOpen}
			                    title="Discard unsaved changes?"
			                    description="Unsaved changes will be lost. Are you sure?"
			                    icon="triangle-exclamation"
			                    onCancel={() => setIsCancelConfirmOpen(false)}
			                    onConfirm={() => {
				                    setIsCancelConfirmOpen(false);
				                    discardChanges();
			                    }}/>
		</>
	);
}
