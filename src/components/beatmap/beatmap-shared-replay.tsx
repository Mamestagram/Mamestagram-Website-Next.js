import Link from "next/link";
import BeatmapSharedReplayViewer from "@/components/beatmap/beatmap-shared-replay-viewer";
import { getBeatmapReplay, type Beatmap } from "@/database/beatmap";
import { canViewProfile } from "@/lib/profile-visibility";
import { parseReplayId } from "@/lib/replay-share";
import { getCurrentUser } from "@/lib/session";
import styles from "@s/replay-viewer.module.css";

export default async function BeatmapSharedReplay({ map, replay }: Readonly<{
	map: Beatmap;
	replay?: string | string[];
}>) {
	if (replay === undefined) return null;
	const scoreId = parseReplayId(replay);
	if (scoreId === null) return <p className={styles.replay_notice} role="status">The replay link is invalid.</p>;
	const user = await getCurrentUser();
	if (!user.isLoggedIn) return <p className={styles.replay_notice} role="status"><Link href="/signin">Sign in</Link> to watch this replay.</p>;
	const score = await getBeatmapReplay(map.md5, scoreId);
	if (!score || !canViewProfile(score.userId, false, { isPrivate: score.isPrivate, ownerId: null }, user))
		return <p className={styles.replay_notice} role="status">This replay is unavailable or private.</p>;
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");
	return <BeatmapSharedReplayViewer key={score.id} scoreId={score.id} beatmapHref={`/beatmaps/${map.setId}/${map.id}`}
		label={`${score.name} — ${map.artist} — ${map.title}`} replayUrl={`https://render.${baseDomain}/embed/${score.id}`}/>;
}
