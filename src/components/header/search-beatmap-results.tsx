import FontAwesome from "@/components/font-awesome";
import SearchGroupActions from "@/components/header/search-group-actions";
import SearchBeatmapList from "@/components/search/search-beatmap-list";
import type { SearchBeatmap } from "@/lib/search";
import styles from "@s/header-search.module.css";

export default function SearchBeatmapResults({ beatmaps, query, total, onSelect }: Readonly<{
	beatmaps: SearchBeatmap[],
	query: string,
	total: number,
	onSelect: () => void
}>) {
	return (
		<section className={styles.result_group} aria-labelledby="beatmap-search-results">
			<h2 id="beatmap-search-results" className={styles.result_group_heading}>
				<span><FontAwesome prefix="fad" name="compact-disc"/>Beatmaps</span>
				<SearchGroupActions category="beatmaps" query={query} total={total} onSelect={onSelect}/>
			</h2>
			<SearchBeatmapList items={beatmaps} onSelect={onSelect}/>
		</section>
	);
}
