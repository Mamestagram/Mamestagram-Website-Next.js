import classNames from "classnames";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { accountExists, getName, getInfo, ScoreScope } from "@/database/profile";
import { getRankHistory } from "@/database/rank-history";
import { writeLog } from "@/lib/log";
import { resolveProfileBackgroundUrl, resolveProfileBannerUrl } from "@/lib/profile-banner";
import { getCurrentUser } from "@/lib/session";
import { ModeNum, OsuMode } from "@/lib/mode";
import UserInfo from "@/components/profile/user-info";
import AboutMe from "@/components/profile/me";
import ClanMembers from "@/components/profile/clan-members";
import PlayerScores from "@/components/profile/player-scores";
import ProfileBackground from "@/components/profile/profile-background";
import ProfileBanner from "@/components/profile/profile-banner";
import Statistics from "@/components/profile/statistics";
import Achievements from "@/components/profile/achievements";
import { PlayerScoresLoading, StatisticsLoading } from "@/components/profile/suspense-loading";
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
	void writeLog("GET", `/profile/${id_param}/${mode_name} ${queries}`); // log

	if (conds.every((cond) => cond)) {
		const id = Number(id_param), mode = ModeNum[mode_name as OsuMode],
			isClan = clan !== undefined, isDans = dans !== undefined;
		if (id >= (!isClan ? 3 : 1) && await accountExists(id, isClan)) {
			const baseDomain = process.env.BASE_DOMAIN;
			if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");
			const [info, currentUser, rankHistory, bannerUrl, backgroundUrl] = await Promise.all([
				getInfo(id, isClan),
				getCurrentUser(),
				!isClan ? getRankHistory(id, mode) : null,
				resolveProfileBannerUrl(id, isClan, baseDomain),
				resolveProfileBackgroundUrl(id, isClan, baseDomain)
			]);
			const canManageProfile = currentUser.isLoggedIn && currentUser.id === (isClan ? info.ownerId : id);

			return (
				<div className={classNames(styles.profile_page, {
					[styles.with_background]: backgroundUrl !== null
				})}>
					{backgroundUrl && <ProfileBackground imageUrl={backgroundUrl}/>}
					<ProfileBanner imageUrl={bannerUrl}/>
					<div className={classNames(styles.container, styles.with_cover)}>
						<div className={classNames(styles.section_area, styles.hero)}>
							<UserInfo id={id}
							          info={info}
							          mode={mode_name as OsuMode}
							          isClan={isClan}
							          isDans={isDans}
							          canManageProfile={canManageProfile}
							          rankHistory={rankHistory}>
								{isClan && <Suspense fallback={
									<div className={styles.clan_members_loading}>Loading clan members…</div>
								}>
									<ClanMembers clanId={id}
									             mode={mode_name as OsuMode}
									             isDans={isDans}
									             canManage={canManageProfile}/>
								</Suspense>}
							</UserInfo>
							<div className={classNames(styles.section_box, styles.statistics)}>
								<Suspense fallback={<StatisticsLoading/>}>
									<Statistics id={id} mode={mode} isClan={isClan} isDans={isDans}/>
								</Suspense>
							</div>
						</div>
						<AboutMe bbCode={info.userpageContent}
						         canEdit={canManageProfile}
						         profileId={id}
						         isClan={isClan}
						         mode={mode_name}/>
						<div className={classNames(styles.section_area, styles.map_scores, { [styles.clan_map_scores]: isClan })}>
							{!isClan && <div className={styles.player_scores}>
								<div className={classNames(styles.section_box, styles.list_container)}>
									<Suspense fallback={<PlayerScoresLoading label="Best Performance"/>}>
										<PlayerScores scope={ScoreScope.bestPP} id={id} mode={mode} isDans={isDans}/>
									</Suspense>
								</div>
								<div className={classNames(styles.section_box, styles.list_container)}>
									<Suspense fallback={<PlayerScoresLoading label="First Place Ranks"/>}>
										<PlayerScores scope={ScoreScope.firstPlace} id={id} mode={mode} isDans={isDans}/>
									</Suspense>
								</div>
								<div className={classNames(styles.section_box, styles.list_container)}>
									<Suspense fallback={<PlayerScoresLoading label="Most Played Maps" hasGrade={false}/>}>
										<PlayerScores scope={ScoreScope.mostPlayed} id={id} mode={mode} isDans={isDans}/>
									</Suspense>
								</div>
								<div className={classNames(styles.section_box, styles.list_container)}>
									<Suspense fallback={<PlayerScoresLoading label="Recent Played Maps"/>}>
										<PlayerScores scope={ScoreScope.recentPlayed} id={id} mode={mode} isDans={isDans}/>
									</Suspense>
								</div>
							</div>}
							<Achievements id={id}
							              mode={mode}
							              canRevealSecretConditions={!isClan && currentUser.isLoggedIn && currentUser.id === id}/>
						</div>
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
