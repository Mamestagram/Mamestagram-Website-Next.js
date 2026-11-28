"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "@/components/confirmation-dialog";
import FontAwesome from "@/components/font-awesome";
import HomeUpdateDialog from "@/components/home/home-update-dialog";
import HomeUpdatesList from "@/components/home/home-updates-list";
import NewsList from "@/components/news-list";
import { parseHomeUpdateInput, parseHomeUpdatesPage, type HomeUpdate, type HomeUpdateInput, type HomeUpdatesPage } from "@/lib/home-updates";
import { readMutationResponse, type MutationResponse } from "@/lib/mutation-response";
import styles from "@s/home.module.css";

export default function HomeUpdatesEditor({ page, unavailable, heading, presentation = "home" }: Readonly<{
	page: HomeUpdatesPage;
	unavailable: string | null;
	heading: ReactNode;
	presentation?: "home" | "news";
}>) {
	const router = useRouter();
	const [form, setForm] = useState<(HomeUpdateInput & { id: number | null }) | null>(null);
	const [deleting, setDeleting] = useState<HomeUpdate | null>(null);
	const [older, setOlder] = useState<HomeUpdatesPage | null>(null);
	const [message, setMessage] = useState<MutationResponse | null>(null);
	const [isPending, startTransition] = useTransition();
	const busyRef = useRef(false);
	const items = [...page.items, ...(older?.items.filter((item) => !page.items.some(({ id }) => id === item.id)) ?? [])];
	const nextCursor = older ? older.nextCursor : page.nextCursor;
	const parsedInput = parseHomeUpdateInput(form);
	const original = form?.id === null ? undefined : items.find((item) => item.id === form?.id);
	const canSave = parsedInput !== null && (!original || parsedInput.category !== original.category || parsedInput.title !== original.title || parsedInput.version !== original.version || parsedInput.contents !== original.contents);
	const beginEdit = (item?: HomeUpdate) => {
		setForm(item ? { id: item.id, version: item.version, category: item.category, title: item.title, contents: item.contents } : { id: null, version: page.items[0]?.version ?? "", category: "updates", title: "", contents: "" });
		setMessage(null);
	};
	const closeEditor = () => {
		if (busyRef.current) return;
		setForm(null);
		setMessage(null);
	};
	const mutate = (method: "POST" | "PATCH" | "DELETE", body: { id: number } | (HomeUpdateInput & { id: number | null })) => {
		if (busyRef.current) return;
		busyRef.current = true;
		setMessage(null);
		startTransition(async () => {
			try {
				const response = await fetch("/api/home-updates", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
				const result = await readMutationResponse(response);
				setMessage(result);
				if (response.ok && result.success) {
					setForm(null);
					setDeleting(null);
					setOlder(null);
					router.refresh();
				}
			} catch {
				setMessage({ success: false, message: "Updates could not be saved. Please try again." });
			} finally { busyRef.current = false; }
		});
	};
	const save = () => {
		const input = parseHomeUpdateInput(form);
		if (!form || !input || !canSave) return;
		mutate(form.id === null ? "POST" : "PATCH", { ...input, id: form.id });
	};
	const loadOlder = () => {
		if (busyRef.current || nextCursor === null) return;
		busyRef.current = true;
		setMessage(null);
		startTransition(async () => {
			try {
				const response = await fetch(`/api/home-updates?before=${nextCursor}`, { cache: "no-store" });
				if (!response.ok) { setMessage(await readMutationResponse(response)); return; }
				const data: unknown = await response.json();
				const next = parseHomeUpdatesPage(data);
				if (!next) { setMessage({ success: false, message: "Updates could not be loaded." }); return; }
				setOlder((current) => ({ items: [...(current?.items ?? []), ...next.items], nextCursor: next.nextCursor }));
			} catch { setMessage({ success: false, message: "Updates could not be loaded. Please try again." }); }
			finally { busyRef.current = false; }
		});
	};
	return <div className={styles.updates_manager}>
		<div className={styles.updates_heading}>
			{heading}
			<button type="button" className={styles.updates_button} disabled={isPending || unavailable !== null} onClick={() => beginEdit()}><FontAwesome prefix="fas" name="plus"/> Add update</button>
		</div>
		{unavailable && <p className={styles.updates_notice} role="status">{unavailable}</p>}
		{message && !form && !deleting && <p
			className={presentation === "news" && message.success ? styles.updates_status : styles.updates_notice}
			data-success={message.success} role={message.success ? "status" : "alert"}
		>{message.message}</p>}
		{form && <HomeUpdateDialog value={form} isPending={isPending} canSave={canSave} message={message} onChange={setForm} onSave={save} onClose={closeEditor}/>}
		{presentation === "news" ? <NewsList items={items} disabled={isPending} onEdit={beginEdit} onDelete={(item) => { setDeleting(item); setMessage(null); }}/> : <HomeUpdatesList items={items} disabled={isPending} onEdit={beginEdit} onDelete={(item) => { setDeleting(item); setMessage(null); }}/>}
		{presentation === "home" && nextCursor !== null && <button type="button" className={styles.updates_button} disabled={isPending} onClick={loadOlder}>Load older updates</button>}
		<ConfirmationDialog isOpen={deleting !== null} title="Delete update?" description={deleting ? `“${deleting.title}” will be permanently deleted.` : ""} icon="trash-can" confirmLabel="Delete" pendingLabel="Deleting…" isPending={isPending} error={message?.success === false ? message.message : undefined} onCancel={() => { setDeleting(null); setMessage(null); }} onConfirm={() => { if (deleting) mutate("DELETE", { id: deleting.id }); }}/>
	</div>;
}
