"use client";

import {
	useEffect,
	useId,
	useRef,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/confirmation-dialog.module.css";

type ConfirmAction = (formData: FormData) => void | Promise<void>;

type ConfirmationHandler =
	| { confirmAction: ConfirmAction; onConfirm?: never }
	| { confirmAction?: never; onConfirm: () => void };

const subscribeToClient = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

type ConfirmationDialogProps = Readonly<
	{
		isOpen: boolean;
		title: string;
		description: ReactNode;
		icon: string;
		confirmLabel?: string;
		cancelLabel?: string;
		pendingLabel?: string;
		isPending?: boolean;
		error?: ReactNode;
		tone?: "danger" | "success";
		singleAction?: boolean;
		onCancel: () => void;
	} & ConfirmationHandler
>;

export default function ConfirmationDialog({
	isOpen,
	title,
	description,
	icon,
	confirmLabel = "Yes",
	cancelLabel = "No",
	pendingLabel,
	isPending = false,
	error,
	tone = "danger",
	singleAction = false,
	onCancel,
	confirmAction,
	onConfirm,
}: ConfirmationDialogProps) {
	const isClient = useSyncExternalStore(
		subscribeToClient,
		getClientSnapshot,
		getServerSnapshot,
	);
	const titleId = useId();
	const cancelButtonRef = useRef<HTMLButtonElement>(null);
	const confirmButtonRef = useRef<HTMLButtonElement>(null);
	const onCancelRef = useRef(onCancel);
	
	useEffect(() => {
		onCancelRef.current = onCancel;
	}, [onCancel]);
	
	useEffect(() => {
		if (!isOpen) return;
		
		const previousOverflow = document.body.style.overflow;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !isPending) onCancelRef.current();
		};
		
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", closeOnEscape);
		requestAnimationFrame(() => {
			if (singleAction) confirmButtonRef.current?.focus();
			else cancelButtonRef.current?.focus();
		});
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isOpen, isPending, singleAction]);
	
	if (!isOpen || !isClient) return null;
	
	const confirmButton = (
		<button
			ref={confirmButtonRef}
			type={confirmAction ? "submit" : "button"}
			className={styles.confirm}
			disabled={isPending}
			onClick={onConfirm}
		>
			{isPending && pendingLabel ? pendingLabel : confirmLabel}
		</button>
	);
	
	return createPortal(
		<div
			className={styles.overlay}
			data-theme-independent="true"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget && !isPending) onCancel();
			}}
		>
			<section
				className={styles.dialog}
				role={singleAction ? "dialog" : "alertdialog"}
				data-tone={tone}
				aria-modal="true"
				aria-labelledby={titleId}
			>
        <span className={styles.icon}>
          <FontAwesome prefix="fad" name={icon}/>
        </span>
				<h2 id={titleId}>{title}</h2>
				<p>{description}</p>
				{error && <small role="alert">{error}</small>}
				<div className={styles.actions} data-single-action={singleAction}>
					{!singleAction && (
						<button
							ref={cancelButtonRef}
							type="button"
							disabled={isPending}
							onClick={onCancel}
						>
							{cancelLabel}
						</button>
					)}
					{confirmAction ? (
						<form action={confirmAction}>{confirmButton}</form>
					) : (
						confirmButton
					)}
				</div>
			</section>
		</div>,
		document.body,
	);
}
