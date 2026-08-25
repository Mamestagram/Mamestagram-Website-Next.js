import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BeatmapHero from "@/components/beatmap/beatmap-hero";
import BeatmapLeaderboard, {
	type BeatmapLeaderboardSearchParams
} from "@/components/beatmap/beatmap-leaderboard";
import { getBeatmap, getBeatmapDifficulties } from "@/database/beatmap";
import { writeLog } from "@/lib/log";
import styles from "@s/beatmap.module.css";

type PageParams = { set_id: string, map_id: string };

const parseId = (value: string) => {
	if (!/^-?\d+$/.test(value)) return null;
	const id = Number(value);
	return Number.isSafeInteger(id) ? id : null;
};

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
	const { set_id, map_id } = await params;
	const setId = parseId(set_id), mapId = parseId(map_id);
	if (setId === null || mapId === null) return { title: "Beatmap not found" };
	const map = await getBeatmap(setId, mapId);
	return map
		? { title: `${map.artist} - ${map.title}` }
		: { title: "Beatmap not found" };
}

export default async function BeatmapPage({ params, searchParams }: Readonly<{
	params: Promise<PageParams>,
	searchParams: Promise<BeatmapLeaderboardSearchParams>
}>) {
	const [{ set_id, map_id }, query] = await Promise.all([params, searchParams]);
	const queries = `(mode: ${query.mode}, mods: ${query.mods})`;
	void writeLog("GET", `/beatmaps/${set_id}/${map_id} ${queries}`);
	
	const setId = parseId(set_id), mapId = parseId(map_id);
	if (setId === null || mapId === null) notFound();
	
	const map = await getBeatmap(setId, mapId);
	if (!map) notFound();
	const difficulties = getBeatmapDifficulties(map.setId, map.server);
	
	return (
		<div className={styles.page}>
			<BeatmapHero map={map} difficulties={difficulties}/>
			<BeatmapLeaderboard map={map} searchParams={query}/>
		</div>
	);
}
