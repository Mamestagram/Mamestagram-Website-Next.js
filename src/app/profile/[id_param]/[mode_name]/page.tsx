import classNames from "classnames";
import { notFound } from "next/navigation";
import { writeLog } from "@/lib/log";
import { OsuMode } from "@/lib/mode";
import UserInfo from "@/components/profile/user-info";
import CurrentGoal from "@/components/profile/current-goal";
import AboutMe from "@/components/profile/me";
import BestPerformance from "@/components/profile/best-performance";
import FirstPlace from "@/components/profile/first-place";
import MostPlays from "@/components/profile/most-plays";
import RecentPlays from "@/components/profile/recent-plays";
import Statistics from "@/components/profile/statistics";
import style from "@s/profile.module.css";

export default async function Profile({ params, searchParams }: {
	params: Promise<{
		id_param: string,
		mode_name: string
	}>,
	searchParams: Promise<{
		clan?: string,
		dans?: string
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
	writeLog("GET", `/leaderboard/${id_param}/${mode_name} ${queries}`).then();
	
	if (conds.every((cond) => cond)) {
		const id = Number(id_param), mode = mode_name as OsuMode, isClan = clan !== undefined, isDans = dans !== undefined;
		if (id >= (!isClan ? 3 : 1)) {
			return (
				<div className={style.container}>
					<div className={classNames(style.section_area, style.hero)}>
						<UserInfo/>
						<CurrentGoal/>
					</div>
					<AboutMe/>
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