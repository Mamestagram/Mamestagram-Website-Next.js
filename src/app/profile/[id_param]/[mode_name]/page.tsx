import classNames from "classnames";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { accountExists, getName, getInfo, ScoreScope } from "@/database/profile";
import { writeLog } from "@/lib/log";
import { ModeNum, OsuMode } from "@/lib/mode";
import UserInfo from "@/components/profile/user-info";
import AboutMe from "@/components/profile/me";
import PlayerScores from "@/components/profile/player-scores";
import Statistics from "@/components/profile/statistics";
import Achievements from "@/components/profile/achievements";
import styles from "@s/profile.module.css";

export async function generateMetadata({ params, searchParams }: {
	params: Promise<{ id_param: string }>,
	searchParams: Promise<{ clan?: string }>
}): Promise<Metadata> {
	const { id_param } = await params;
	const { clan } = await searchParams;
	const conds = [
		!isNaN(Number(id_param)) && Number(id_param) > 0,
		clan === undefined || clan === "",
	];
	
	let metadata: Metadata;
	if (conds.every((cond) => cond)) {
		const id = Number(id_param), isClan = clan !== undefined;
		if (await accountExists(id, isClan))
			metadata = { title: `${await getName(id, isClan)}・Profile` };
		else
			metadata = { title: "Unknown user" };
	}
	else {
		metadata = { title: "Unknown user" };
	}
	return metadata;
}

export default async function Profile({ params, searchParams }: {
	params: Promise<{
		id_param: string,
		mode_name: string
	}>,
	searchParams: Promise<{
		clan?: string,
		dans?: string,
	}>
}) {
	const { id_param, mode_name } = await params;
	const { clan, dans } = await searchParams;
	const conds = [
		!isNaN(Number(id_param)) && Number(id_param) > 0,
		Object.values(OsuMode).includes(mode_name as OsuMode),
		clan === undefined || clan === "",
		dans === undefined || (dans === "" &&
			[OsuMode.std, OsuMode.taiko, OsuMode.ctb, OsuMode.mania].includes(mode_name as OsuMode))
	];
	const queries = `(clan: ${clan}, dans: ${dans})`;
	writeLog("GET", `/profile/${id_param}/${mode_name} ${queries}`).then(); // log
	
	if (conds.every((cond) => cond)) {
		const id = Number(id_param), mode = ModeNum[mode_name as OsuMode],
			isClan = clan !== undefined, isDans = dans !== undefined;
		if (id >= (!isClan ? 3 : 1) && await accountExists(id, isClan)) {
			const info = await getInfo(id, isClan);
			
			return (
				<div className={styles.container}>
					<div className={classNames(styles.section_area, styles.hero)}>
						<UserInfo id={id} info={info}/>
						<div className={classNames(styles.section_box, styles.statistics)}>
							<Suspense>
								<Statistics id={id} mode={mode} isClan={isClan} isDans={isDans}/>
							</Suspense>
						</div>
					</div>
					<AboutMe bbCode={info.userpageContent}/>
					<div className={classNames(styles.section_area, styles.map_scores)}>
						<div className={styles.player_scores}>
							<div className={classNames(styles.section_box, styles.list_container)}>
								<Suspense>
									<PlayerScores scope={ScoreScope.bestPP} id={id} mode={mode} isDans={isDans}/>
								</Suspense>
							</div>
							<div className={classNames(styles.section_box, styles.list_container)}>
								<Suspense>
									<PlayerScores scope={ScoreScope.firstPlace} id={id} mode={mode} isDans={isDans}/>
								</Suspense>
							</div>
							<div className={classNames(styles.section_box, styles.list_container)}>
								<Suspense>
									<PlayerScores scope={ScoreScope.mostPlayed} id={id} mode={mode} isDans={isDans}/>
								</Suspense>
							</div>
							<div className={classNames(styles.section_box, styles.list_container)}>
								<Suspense>
									<PlayerScores scope={ScoreScope.recentPlayed} id={id} mode={mode} isDans={isDans}/>
								</Suspense>
							</div>
						</div>
						<Achievements id={id} mode={mode}/>
					</div>
				</div>
			);
		}
		else {
			notFound();
		}
	}
	else {
		notFound();
	}
}