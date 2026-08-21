import classNames from "classnames";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import {
	getClanProfile,
	getClanStatistics,
	getProfileRouteInfo,
	getUserInfo,
	ScoreScope,
	type ClanMember,
	type PlayerStatistics,
	type Profile as ProfileInfo
} from "@/database/profile";
import { getRankHistory } from "@/database/rank-history";
import { writeLog } from "@/lib/log";
import { resolveProfileAvatarUrl, resolveProfileBackgroundUrl, resolveProfileBannerUrl } from "@/lib/profile-banner";
import { getCurrentUser } from "@/lib/session";
import { ModeNum, OsuMode } from "@/lib/mode";
import { getProfileCosmetics } from "@/lib/profile-cosmetics";
import { canViewProfile } from "@/lib/profile-visibility";
import { isProfileRival } from "@/lib/rivals";
import UserInfo from "@/components/profile/user-info";
import AboutMe from "@/components/profile/me";
import ClanMembers from "@/components/profile/clan-members";
import PlayerScores from "@/components/profile/player-scores";
import ProfileBackground from "@/components/profile/profile-background";
import ProfileBanner from "@/components/profile/profile-banner";
import Statistics from "@/components/profile/statistics";
import Achievements from "@/components/profile/achievements";
import { PlayerScoresLoading, StatisticsLoading } from "@/components/profile/suspense-loading";
import PrivateProfile from "@/components/profile/private-profile";
import styles from "@s/profile.module.css";

type ProfileData =
	| { type: "user", info: ProfileInfo }
	| { type: "clan", info: ProfileInfo, members: ClanMember[], statistics: ReturnType<typeof getClanStatistics> };

const getProfileData = cache(async (
	id: number,
	isClan: boolean,
	mode: ModeNum,
	isDans: boolean
): Promise<ProfileData | null> => {
	if (!isClan) return { type: "user", info: await getUserInfo(id) };

	const clanProfile = await getClanProfile(id);
	if (!clanProfile) return null;
	return {
		type: "clan",
		info: clanProfile.info,
		members: clanProfile.members,
		statistics: getClanStatistics(clanProfile, mode, isDans)
	};
});

export async function generateMetadata({ params, searchParams }: {
	params: Promise<{ id_param: string, mode_name: string }>,
	searchParams: Promise<{ clan?: string, dans?: string }>
}): Promise<Metadata> {
	const { id_param, mode_name } = await params;
	const { clan, dans } = await searchParams;
	const conds = [
		!isNaN(Number(id_param)) && Number(id_param) > 0,
		Object.values(OsuMode).includes(mode_name as OsuMode),
		clan === undefined || clan === "",
		dans === undefined || (dans === "" &&
			[OsuMode.std, OsuMode.taiko, OsuMode.ctb, OsuMode.mania].includes(mode_name as OsuMode))
	];

	if (!conds.every((cond) => cond)) return { title: "Unknown user" };

	const id = Number(id_param), isClan = clan !== undefined, isDans = dans !== undefined;
	if (id < (!isClan ? 3 : 1)) return { title: "Unknown user" };
	const mode = ModeNum[mode_name as OsuMode];
	const [profileRouteInfo, currentUser] = await Promise.all([
		getProfileRouteInfo(id, isClan),
		getCurrentUser()
	]);
	if (!profileRouteInfo) return { title: "Unknown user" };
	if (!canViewProfile(id, isClan, profileRouteInfo, currentUser))
		return { title: "Private profile", robots: { index: false, follow: false } };

	const profileData = await getProfileData(id, isClan, mode, isDans);
	if (!profileData) return { title: "Unknown user" };

	return { title: `${profileData.info.name}・Profile` };
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
		if (id >= (!isClan ? 3 : 1)) {
			const [profileRouteInfo, currentUser] = await Promise.all([
				getProfileRouteInfo(id, isClan),
				getCurrentUser()
			]);
			if (!profileRouteInfo) notFound();
			if (!canViewProfile(id, isClan, profileRouteInfo, currentUser)) return <PrivateProfile/>;

			const profileData = await getProfileData(id, isClan, mode, isDans);
			if (!profileData) notFound();

			const baseDomain = process.env.BASE_DOMAIN;
			if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");
			const [rankHistory, avatarUrl, bannerUrl, backgroundUrl, cosmetics, isRival] = await Promise.all([
				!isClan ? getRankHistory(id, mode) : null,
				resolveProfileAvatarUrl(id, isClan, baseDomain),
				resolveProfileBannerUrl(id, isClan, baseDomain),
				resolveProfileBackgroundUrl(id, isClan, baseDomain),
				!isClan ? getProfileCosmetics(id) : null,
				!isClan && currentUser.isLoggedIn && currentUser.id !== undefined && currentUser.id !== id
					? isProfileRival(currentUser.id, id)
					: false
			]);
			const info = profileData.info;
			const clanMembers = profileData.type === "clan" ? profileData.members : [];
			const clanStatistics: PlayerStatistics | undefined = profileData.type === "clan"
				? profileData.statistics
				: undefined;
			const canManageProfile = currentUser.isLoggedIn && currentUser.id === (isClan ? info.ownerId : id);
			const followsCurrentUser = !isClan
				&& currentUser.isLoggedIn
				&& currentUser.id !== undefined
				&& currentUser.id !== id
				&& (info.following.some(({ user }) => user === currentUser.id)
					|| info.mutual.some(({ user }) => user === currentUser.id));

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
							          isRival={isRival}
							          followsYou={followsCurrentUser}
							          rankHistory={rankHistory}
							          avatarUrl={avatarUrl}
							          cosmetics={cosmetics}>
								{isClan &&
									<ClanMembers clanId={id}
									             members={clanMembers}
									             mode={mode_name as OsuMode}
									             isDans={isDans}
									             canManage={canManageProfile}
									             baseDomain={baseDomain}/>}
							</UserInfo>
							<div className={classNames(styles.section_box, styles.statistics)} data-page-enter="box">
								<Suspense fallback={<StatisticsLoading/>}>
									<Statistics id={id}
									            mode={mode}
									            isClan={isClan}
									            isDans={isDans}
									            statistics={clanStatistics}/>
								</Suspense>
							</div>
						</div>
						<AboutMe bbCode={info.userpageContent}
						         canEdit={canManageProfile}
						         profileId={id}
						         isClan={isClan}
						         mode={mode_name}/>
						{!isClan && <div className={classNames(styles.section_area, styles.map_scores)}>
							<div className={styles.player_scores}>
								<div className={classNames(styles.section_box, styles.list_container)} data-page-enter="box">
									<Suspense fallback={<PlayerScoresLoading label="Best Performance"/>}>
										<PlayerScores scope={ScoreScope.bestPP} id={id} mode={mode} isDans={isDans}/>
									</Suspense>
								</div>
								<div className={classNames(styles.section_box, styles.list_container)} data-page-enter="box">
									<Suspense fallback={<PlayerScoresLoading label="First Place Ranks"/>}>
										<PlayerScores scope={ScoreScope.firstPlace} id={id} mode={mode} isDans={isDans}/>
									</Suspense>
								</div>
								<div className={classNames(styles.section_box, styles.list_container)} data-page-enter="box">
									<Suspense fallback={<PlayerScoresLoading label="Most Played Maps" hasGrade={false}/>}>
										<PlayerScores scope={ScoreScope.mostPlayed} id={id} mode={mode} isDans={isDans}/>
									</Suspense>
								</div>
								<div className={classNames(styles.section_box, styles.list_container)} data-page-enter="box">
									<Suspense fallback={<PlayerScoresLoading label="Recent Played Maps"/>}>
										<PlayerScores scope={ScoreScope.recentPlayed} id={id} mode={mode} isDans={isDans}/>
									</Suspense>
								</div>
							</div>
							<Achievements id={id}
							              mode={mode}
							              canRevealSecretConditions={currentUser.isLoggedIn && currentUser.id === id}/>
						</div>}
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
