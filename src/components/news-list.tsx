import Link from "next/link";
import FontAwesome from "@/components/font-awesome";
import type { HomeUpdate } from "@/lib/home-updates";
import { getNewsExcerpt } from "@/lib/news";
import styles from "@s/news.module.css";

export default function NewsList({ items, onEdit, onDelete, disabled = false }: Readonly<{
	items: readonly HomeUpdate[];
	onEdit?: (item: HomeUpdate) => void;
	onDelete?: (item: HomeUpdate) => void;
	disabled?: boolean;
}>) {
	if (!items.length) return <p className={styles.notice}>No news here yet. Check back for the latest updates.</p>;
	return <ol className={styles.posts}>
		{items.map((item) => <li key={item.id} className={styles.post}>
			<div className={styles.meta}>
				<span className={styles.category} data-category={item.category}>{item.category === "updates" ? "Update" : "Fix"}</span>
				<span className={styles.version}>Version {item.version}</span>
			</div>
			<Link className={styles.post_link} href={`/news/${item.id}`}>
				<h2>{item.title}</h2>
				<p>{getNewsExcerpt(item.contents)}</p>
				<span className={styles.read_more}>Read article <FontAwesome prefix="fas" name="arrow-right"/></span>
			</Link>
			{onEdit && onDelete && <div className={styles.actions}>
				<button type="button" disabled={disabled} onClick={() => onEdit(item)}><FontAwesome prefix="fas" name="pen"/> Edit</button>
				<button type="button" disabled={disabled} onClick={() => onDelete(item)} aria-label={`Delete: ${item.title}`}><FontAwesome prefix="fas" name="trash-can"/> Delete</button>
			</div>}
		</li>)}
	</ol>;
}
