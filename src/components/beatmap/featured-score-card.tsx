import classNames from "classnames";
import Link from "next/link";
import FloatingCountryFlag from "@/components/floating-country-flag";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import PlayerAvatar from "@/components/player-avatar";
import ReplayViewer from "@/components/replay-viewer";
import ScoreMods from "@/components/beatmap/score-mods";
import type { BeatmapScore } from "@/database/beatmap";
import type { OsuMode } from "@/lib/mode";
import type { ProfileCosmetics } from "@/lib/profile-cosmetics";
import styles from "@s/beatmap.module.css";

export default function FeaturedScoreCard({
	score,
	cosmetics,
	rank,
	mode,
	mapMaxCombo,
	achievedTime,
	replayLabel,
	replayUrl,
	baseDomain,
	personal = false,
	hidePrivateDetails = false
}: Readonly<{
	score: BeatmapScore,
	cosmetics: ProfileCosmetics | null,
	rank: number,
	mode: OsuMode,
	mapMaxCombo: number,
	achievedTime: string,
	replayLabel: string,
	replayUrl: string,
	baseDomain: string,
	personal?: boolean,
	hidePrivateDetails?: boolean
}>) {
	if (hidePrivateDetails) return (
		<div className={styles.top_score} data-private="true">
			<span className={styles.top_rank}>#{rank}</span>
			<strong className={styles.private_score_name}>Private User</strong>
		</div>
	);
	
	return (
		<div className={classNames(styles.top_score, { [styles.personal_score]: personal })}
		     data-rank={personal ? rank : undefined}>
			<span className={classNames(styles.top_rank, { [styles.personal_rank]: personal })}>#{rank}</span>
			<span className={styles.top_grade} data-grade={score.grade.toLowerCase()}>
				{score.grade.replace(/H$/, "")}
			</span>
			<Link className={styles.top_avatar} href={`/profile/${score.userId}/${mode}`}>
				<PlayerAvatar userId={score.userId}
				              name={score.name}
				              baseDomain={baseDomain}
				              cosmetics={cosmetics}
				              className={styles.top_avatar_image}
				              sizes="64px"/>
			</Link>
			<span className={styles.top_player}>
				<Link href={`/profile/${score.userId}/${mode}`}>{score.name}</Link>
				<span>
					<FloatingCountryFlag code={score.country}/>
					<small>achieved {achievedTime} ago</small>
				</span>
			</span>
			<span className={styles.top_metric}>
				<small>Total score</small>
				<strong><span><FormattedNumber value={score.score}/></span></strong>
			</span>
			<span className={styles.top_metric}>
				<small>Accuracy</small>
				<strong className={classNames({ [styles.perfect_value]: score.accuracy === 100 })}>
					<span>{score.accuracy.toFixed(2)}%</span>
				</strong>
			</span>
			<span className={styles.top_metric}>
				<small>Max combo</small>
				<strong className={classNames({ [styles.perfect_value]: score.maxCombo === mapMaxCombo })}>
					<span><FormattedNumber value={score.maxCombo}/>x</span>
				</strong>
			</span>
			<span className={classNames(styles.top_metric, styles.top_pp)}>
				<small>Performance</small>
				<strong><span><FormattedNumber value={Math.round(score.pp)}/><small>pp</small></span></strong>
			</span>
			<ScoreMods mods={score.mods}/>
			{score.id > 0
				? <ReplayViewer className={styles.featured_replay_button}
				                label={replayLabel}
				                replayUrl={replayUrl}
				                buttonLabel={`Watch ${score.name}'s replay`}>
					<FontAwesome prefix="fas" name="circle-play"/>
				</ReplayViewer>
				: <span className={styles.replay_unavailable}>—</span>}
		</div>
	);
}
