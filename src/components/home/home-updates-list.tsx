import Link from "next/link";
import FontAwesome from "@/components/font-awesome";
import Markdown from "@/components/markdown";
import type { HomeUpdate } from "@/lib/home-updates";
import styles from "@s/home.module.css";

export default function HomeUpdatesList({ items, onEdit, onDelete, disabled = false }: Readonly<{
	items: readonly HomeUpdate[];
	onEdit?: (item: HomeUpdate) => void;
	onDelete?: (item: HomeUpdate) => void;
	disabled?: boolean;
}>) {
	if (items.length === 0) return <p className={styles.updates_empty}>No news yet.</p>;
	return <ol className={styles.updates_list}>
		{items.map((item) => <li key={item.id} data-page-enter="box">
			<div className={styles.update_meta}>
				<span className={styles.update_heading}>
					<Link className={styles.update_title} href={`/news/${item.id}`}>{item.title}</Link>
					<span className={styles.update_category} data-category={item.category}>{item.category === "updates" ? "Update" : "Fix"}</span>
				</span>
				<span className={styles.update_version} aria-label={`Version ${item.version}`}>{item.version}</span>
			</div>
			<Markdown className={styles.update_contents} source={item.contents || "No additional details."}/>
			{onEdit && onDelete && <div className={styles.update_actions}>
				<button type="button" disabled={disabled} onClick={() => onEdit(item)} aria-label={`Edit: ${item.title}`} title="Edit"><FontAwesome prefix="fas" name="pen"/></button>
				<button type="button" disabled={disabled} onClick={() => onDelete(item)} aria-label={`Delete: ${item.title}`} title="Delete"><FontAwesome prefix="fas" name="trash-can"/></button>
			</div>}
		</li>)}
	</ol>;
}
