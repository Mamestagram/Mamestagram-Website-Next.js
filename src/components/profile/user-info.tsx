import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Profile } from "@/database/profile";
import { ModeNum, OsuMode, type VnMode } from "@/lib/mode";
import { Priv } from "@/lib/priv";
import CountryFlag from "@/components/country-flag";
import EquippedBadge from "@/components/equipped-badge";
import FontAwesome from "@/components/font-awesome";
import ModeIcon from "@/components/mode-icon";
import ProfileModeSelection from "@/components/profile/mode-selection";
import SetMainModeButton from "@/components/profile/set-main-mode-button";
import RankHistoryChart from "@/components/profile/rank-history";
import SocialConnections from "@/components/profile/social-connections";
import type { RankHistory } from "@/database/rank-history";
import styles from "@s/profile.module.css";

const privilegeMeta: Partial<Record<Priv, {
	label: string,
	icon: string,
	className: string
}>> = {
	[Priv.whitelisted]: { label: "Verified", icon: "badge-check", className: styles.priv_verified },
	[Priv.supporter]: { label: "Supporter", icon: "heart", className: styles.priv_supporter },
	[Priv.premium]: { label: "Premium", icon: "gem", className: styles.priv_premium },
	[Priv.alumni]: { label: "Alumni", icon: "graduation-cap", className: styles.priv_alumni },
	[Priv.tourneyManager]: { label: "Tournament Manager", icon: "trophy", className: styles.priv_tourney },
	[Priv.nominator]: { label: "Nominator", icon: "pen-nib", className: styles.priv_nominator },
	[Priv.moderator]: { label: "Moderator", icon: "shield-halved", className: styles.priv_moderator },
	[Priv.administrator]: { label: "Administrator", icon: "user-shield", className: styles.priv_administrator },
	[Priv.developer]: { label: "Developer", icon: "code", className: styles.priv_developer }
};

type PreferredModeMeta = {
	route: OsuMode,
	base: VnMode,
	label: string,
	playstyle?: "Relax" | "Autopilot"
};

function getPreferredMode(mode: ModeNum): PreferredModeMeta {
	switch (mode) {
		case ModeNum.taiko:
			return { route: OsuMode.taiko, base: OsuMode.taiko, label: "Taiko" };
		case ModeNum.rxtaiko:
			return { route: OsuMode.rxtaiko, base: OsuMode.taiko, label: "Taiko", playstyle: "Relax" };
		case ModeNum.ctb:
			return { route: OsuMode.ctb, base: OsuMode.ctb, label: "Catch" };
		case ModeNum.rxctb:
			return { route: OsuMode.rxctb, base: OsuMode.ctb, label: "Catch", playstyle: "Relax" };
		case ModeNum.mania:
			return { route: OsuMode.mania, base: OsuMode.mania, label: "Mania" };
		case ModeNum.rxstd:
			return { route: OsuMode.rxstd, base: OsuMode.std, label: "osu!", playstyle: "Relax" };
		case ModeNum.apstd:
			return { route: OsuMode.apstd, base: OsuMode.std, label: "osu!", playstyle: "Autopilot" };
		default:
			return { route: OsuMode.std, base: OsuMode.std, label: "osu!" };
	}
}

function getCountryMeta(country: string) {
	const code = country.trim().toUpperCase();
	if (!/^[A-Z]{2}$/.test(code)) return { code: "", name: "Unknown", isValid: false };

	try {
		const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code);
		return { code: code.toLowerCase(), name: name ?? code, isValid: true };
	}
	catch {
		return { code: "", name: "Unknown", isValid: false };
	}
}

function formatRelativeTime(date: Date) {
	const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
	if (elapsedSeconds < 10) return "just now";

	const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "always" });
	if (elapsedSeconds < 60) return relativeTime.format(-elapsedSeconds, "second");
	if (elapsedSeconds < 60 * 60) return relativeTime.format(-Math.floor(elapsedSeconds / 60), "minute");
	if (elapsedSeconds < 24 * 60 * 60) return relativeTime.format(-Math.floor(elapsedSeconds / (60 * 60)), "hour");
	if (elapsedSeconds < 7 * 24 * 60 * 60) return relativeTime.format(-Math.floor(elapsedSeconds / (24 * 60 * 60)), "day");
	if (elapsedSeconds < 30 * 24 * 60 * 60) return relativeTime.format(-Math.floor(elapsedSeconds / (7 * 24 * 60 * 60)), "week");
	if (elapsedSeconds < 365 * 24 * 60 * 60) return relativeTime.format(-Math.floor(elapsedSeconds / (30 * 24 * 60 * 60)), "month");
	return relativeTime.format(-Math.floor(elapsedSeconds / (365 * 24 * 60 * 60)), "year");
}

export default function UserInfo({ id, info, mode, isClan, isDans, canManageProfile, rankHistory, children }: {
	id: number,
	info: Profile,
	mode: OsuMode,
	isClan: boolean,
	isDans: boolean,
	canManageProfile: boolean,
	rankHistory: RankHistory | null,
	children?: ReactNode
}) {
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");

	const preferredMode = getPreferredMode(info.preferredMode);
	const selectedMode = ModeNum[mode];
	const country = getCountryMeta(info.country);
	const privileges = info.priv.flatMap((privilege) => {
		const meta = privilegeMeta[privilege];
		return meta ? [{ privilege, ...meta }] : [];
	});
	const hiddenPrivilegeLabels = privileges.slice(3).map(({ label }) => label).join(", ");
	const profileQuery = isClan ? "?clan" : "";
	const avatarSubdomain = isClan ? "clan-a" : "a";
	const countrySort = isDans ? "dans" : "performance";
	const displayName = `${info.tag ?? ""}${info.name}`;
	const nameTooltipId = `profile-name-tooltip-${isClan ? "clan" : "user"}-${id}`;
	const lastOnlineDate = info.latestActivity.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		timeZone: "UTC"
	});
	const lastOnlineTime = info.latestActivity.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		timeZone: "UTC",
		timeZoneName: "short"
	});
	const lastOnlineRelative = formatRelativeTime(info.latestActivity);

	return (
		<div className={classNames(styles.section_box, styles.user_info)} data-page-enter="box">
			<div className={styles.top}>
				<span className={styles.avatar}>
					<Image src={`https://${avatarSubdomain}.${baseDomain}/${id}`}
					       alt="avatar"
					       fill
					       sizes="(max-width: 768px) 100vw, 50vw"
					       draggable={false}
					       priority/>
					{!isClan &&
						<EquippedBadge badgeId={info.setBadge}
						               baseDomain={baseDomain}
						               className={styles.avatar_badge}
						               sizes="36px"
						               priority/>}
				</span>
				<div className={styles.name_container}>
					<div className={styles.name_row}>
						<div className={styles.name_with_tooltip}>
							<h1 className={styles.name} tabIndex={0} aria-describedby={nameTooltipId}>
								{displayName}
							</h1>
							<span id={nameTooltipId} className={styles.name_tooltip} role="tooltip">
								{displayName}
							</span>
						</div>
						<div className={styles.profile_mode_controls}>
							<ProfileModeSelection id={id} mode={mode} isClan={isClan} isDans={isDans}/>
							{canManageProfile && !isDans && selectedMode !== info.preferredMode &&
								<SetMainModeButton profileId={id} mode={mode} isClan={isClan}/>}
						</div>
					</div>
					{info.showPastName && info.pastNames !== null &&
						<p className={styles.past_names}>aka: {info.pastNames}</p>}
				</div>
			</div>

			<div className={styles.meta}>
				<ul className={styles.profile_facts}>
					{!isClan &&
						<li>
							<Link className={styles.meta_chip}
							      href={`/leaderboard/${mode}/${countrySort}${country.isValid ? `?country=${encodeURIComponent(country.code)}` : ""}`}>
								{country.isValid
									? <CountryFlag className={styles.flag} code={country.code}/>
									: <FontAwesome className={styles.flag} prefix="fas" name="globe"/>}
								<span className={styles.meta_copy}>
									<small>Country</small>
									<strong>{country.name}</strong>
								</span>
								<FontAwesome className={styles.meta_link_icon} prefix="fas" name="arrow-up-right"/>
							</Link>
						</li>}
					<li>
						<Link className={styles.meta_chip}
						      href={`/profile/${id}/${preferredMode.route}${profileQuery}`}>
							<ModeIcon mode={preferredMode.base}/>
							<span className={styles.meta_copy}>
								<small>Main mode</small>
								<span className={styles.main_mode_value}>
									<strong>{preferredMode.label}</strong>
									{preferredMode.playstyle &&
										<span className={styles.mode_variant}
										      data-playstyle={preferredMode.playstyle.toLowerCase()}>
											{preferredMode.playstyle}
										</span>}
								</span>
							</span>
							<FontAwesome className={styles.meta_link_icon} prefix="fas" name="arrow-up-right"/>
						</Link>
					</li>
				</ul>

				{!isClan && privileges.length > 0 &&
					<div className={styles.privilege_area}>
						<ul className={styles.privilege_list}>
							{privileges.map(({ privilege, label, icon, className }) =>
								<li key={privilege} className={classNames(styles.privilege_badge, className)}>
									<FontAwesome prefix="fad" name={icon}/>
									{label}
								</li>)}
							{privileges.length > 3 &&
								<li className={classNames(styles.privilege_badge, styles.more_privileges)}
								    title={hiddenPrivilegeLabels}>
									+{privileges.length - 3}
								</li>}
						</ul>
					</div>}
			</div>

			{!isClan &&
				<SocialConnections connections={{
					mutual: info.mutual,
					following: info.following,
					followers: info.followers
				}}
				mode={mode}
				avatarBaseUrl={`https://a.${baseDomain}`}/>}

			{!isClan && <div className={styles.last_online} data-online={info.isOnline}>
				<span className={styles.activity_identity}>
					<span className={styles.activity_icon}>
						<FontAwesome prefix="fad" name={info.isOnline ? "signal-stream" : "clock"}/>
					</span>
					<span className={styles.activity_copy}>
						<small>Presence</small>
						<strong>
							{info.isOnline ? "Online now" : "Last online"}
							{!info.isOnline && <span className={styles.activity_relative}>{lastOnlineRelative}</span>}
						</strong>
					</span>
				</span>
				<time className={styles.activity_time} dateTime={info.latestActivity.toISOString()}>
					<strong>{lastOnlineDate}</strong>
					<small>{lastOnlineTime}</small>
				</time>
			</div>}
			{isClan && children}
			{rankHistory && <RankHistoryChart history={rankHistory}/>}
		</div>
	);
}
