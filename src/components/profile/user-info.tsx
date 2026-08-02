import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import type { Profile } from "@/database/profile";
import { ModeNum, OsuMode, type VnMode } from "@/lib/mode";
import { Priv } from "@/lib/priv";
import CountryFlag from "@/components/country-flag";
import FontAwesome from "@/components/font-awesome";
import ModeIcon from "@/components/mode-icon";
import ProfileModeSelection from "@/components/profile/mode-selection";
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

export default function UserInfo({ id, info, mode, isClan, isDans, rankHistory }: {
	id: number,
	info: Profile,
	mode: OsuMode,
	isClan: boolean,
	isDans: boolean,
	rankHistory: RankHistory | null
}) {
	const preferredMode = getPreferredMode(info.preferredMode);
	const country = getCountryMeta(info.country);
	const privileges = info.priv.flatMap((privilege) => {
		const meta = privilegeMeta[privilege];
		return meta ? [{ privilege, ...meta }] : [];
	});
	const hiddenPrivilegeLabels = privileges.slice(3).map(({ label }) => label).join(", ");
	const profileQuery = isClan ? "?clan" : "";
	const countrySort = isDans ? "dans" : "performance";
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

	return (
		<div className={classNames(styles.section_box, styles.user_info)}>
			<div className={styles.top}>
				<span className={styles.avatar}>
					<Image src={`https://a.${process.env.BASE_DOMAIN}/${id}`}
					       alt="avatar"
					       fill
					       sizes="(max-width: 768px) 100vw, 50vw"
					       draggable={false}
					       priority/>
				</span>
				<span className={styles.name_container}>
					<span className={styles.name_row}>
						<h1 className={styles.name}>{info.tag}{info.name}</h1>
						<ProfileModeSelection id={id} mode={mode} isClan={isClan} isDans={isDans}/>
					</span>
					{info.showPastName && info.pastNames !== null &&
						<p className={styles.past_names}>aka: {info.pastNames}</p>}
				</span>
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
			
			<SocialConnections connections={{
				mutual: info.mutual,
				following: info.following,
				followers: info.followers
			}}
			mode={mode}
			avatarBaseUrl={`https://a.${process.env.BASE_DOMAIN}`}/>
			
			<div className={styles.last_online} data-online={info.isOnline}>
				<span className={styles.activity_identity}>
					<span className={styles.activity_icon}>
						<FontAwesome prefix="fad" name={info.isOnline ? "signal-stream" : "clock"}/>
					</span>
					<span className={styles.activity_copy}>
						<small>Presence</small>
						<strong>{info.isOnline ? "Online now" : "Last online"}</strong>
					</span>
				</span>
				<time className={styles.activity_time} dateTime={info.latestActivity.toISOString()}>
					<strong>{lastOnlineDate}</strong>
					<small>{lastOnlineTime}</small>
				</time>
			</div>
			{rankHistory && <RankHistoryChart history={rankHistory}/>}
		</div>
	);
}
