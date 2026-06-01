import classNames from "classnames";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	accountExists,
	getName,
	getInfo,
	getCurrentGoal,
	getPlayerScores
} from "@/database/profile";
import { writeLog } from "@/lib/log";
import { ModeNum, OsuMode } from "@/lib/mode";
import UserInfo from "@/components/profile/user-info";
import CurrentGoal from "@/components/profile/current-goal";
import AboutMe from "@/components/profile/me";
import BestPerformance from "@/components/profile/best-performance";
import FirstPlace from "@/components/profile/first-place";
import MostPlays from "@/components/profile/most-plays";
import RecentPlays from "@/components/profile/recent-plays";
import Statistics from "@/components/profile/statistics";
import style from "@s/profile.module.css";

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
		dans === undefined || dans === ""
	];
	const queries = `(clan: ${clan}, dans: ${dans})`;
	writeLog("GET", `/profile/${id_param}/${mode_name} ${queries}`).then(); // log
	
	if (conds.every((cond) => cond)) {
		const id = Number(id_param), mode = ModeNum[mode_name as OsuMode],
			isClan = clan !== undefined, isDans = dans !== undefined;
		if (id >= (!isClan ? 3 : 1) && await accountExists(id, isClan)) {
			const [
				info,
				currentGoal,
				playerScores
			] = await Promise.all([
				getInfo(id, isClan),
				getCurrentGoal(id),
				getPlayerScores(id, mode, isDans)
			]);
			
			return (
				<div className={style.container}>
					<div className={classNames(style.section_area, style.hero)}>
						<UserInfo id={id} info={info}/>
						{!isClan && (<CurrentGoal id={id}/>)}
					</div>
					<AboutMe bbCode={info.userpageContent}/>
					<div className={classNames(style.section_area, style.content)}>
						<div className={style.map_playlist}>
							<BestPerformance/>
							<FirstPlace/>
							<MostPlays/>
							<RecentPlays/>
						</div>
						<Statistics/>
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