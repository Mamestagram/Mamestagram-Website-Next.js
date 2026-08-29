import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FontAwesome from "@/components/font-awesome";
import NameBodyHeader from "@/components/name-body-header";
import PlayerAvatar from "@/components/player-avatar";
import AboutMeSettingsEditor from "@/components/settings/about-me-settings-editor";
import ClanSettingsForm from "@/components/settings/clan-settings-form";
import MediaSettingCard from "@/components/settings/media-setting-card";
import ProfileSettingsForm from "@/components/settings/profile-settings-form";
import ThemeSettingsForm from "@/components/settings/theme-settings-form";
import { getOwnedClanSettings, getUserSettings } from "@/database/settings";
import {
	resolveProfileAvatarUrl,
	resolveProfileBackgroundUrl,
	resolveProfileBannerUrl,
} from "@/lib/profile-banner";
import { profileMediaExists } from "@/lib/profile-media";
import { getProfileCosmetics } from "@/lib/profile-cosmetics";
import { writeLog } from "@/lib/log";
import { getCurrentUser } from "@/lib/session";
import styles from "@s/settings.module.css";

export const metadata: Metadata = {
	title: "Settings",
	robots: { index: false, follow: false },
};

type SettingsScope = "personal" | "clan";
type SettingsSection =
	"rename" | "images" | "profile-conf" | "me" | "appearance";
type SectionMeta = {
	title: string;
	icon: string;
};

const profileSectionMeta: Record<SettingsSection, SectionMeta> = {
	rename: {
		title: "Rename",
		icon: "pen-to-square",
	},
	images: {
		title: "Profile images",
		icon: "images",
	},
	me: {
		title: "Me!",
		icon: "id-badge",
	},
	"profile-conf": {
		title: "Profile conf",
		icon: "user-gear",
	},
	appearance: {
		title: "Appearance",
		icon: "palette",
	},
};

const clanSectionMeta: Record<SettingsSection, SectionMeta> = {
	rename: {
		title: "Rename",
		icon: "people-group",
	},
	images: {
		title: "Profile images",
		icon: "images",
	},
	me: {
		title: "Me!",
		icon: "id-badge",
	},
	"profile-conf": {
		title: "Profile conf",
		icon: "user-gear",
	},
	appearance: {
		title: "Appearance",
		icon: "palette",
	},
};

const isSettingsSection = (value: unknown): value is SettingsSection =>
	value === "rename" ||
	value === "images" ||
	value === "profile-conf" ||
	value === "me" ||
	value === "appearance";

const normalizeSettingsSection = (value: unknown): SettingsSection => {
	if (value === "avatar" || value === "banner" || value === "background")
		return "images";
	if (value === "privacy") return "profile-conf";
	return isSettingsSection(value) ? value : "rename";
};

const getSectionMeta = (
	scope: SettingsScope,
	section: SettingsSection,
): SectionMeta => {
	if (scope === "clan") return clanSectionMeta[section];
	return profileSectionMeta[section];
};

export default async function SettingsPage({
	searchParams,
}: Readonly<{
	searchParams: Promise<{
		scope?: string | string[];
		section?: string | string[];
	}>;
}>) {
	const params = await searchParams;
	void writeLog(
		"GET",
		`/settings (scope: ${params.scope}, section: ${params.section})`,
	);
	
	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id || !currentUser.username)
		redirect("/signin");
	
	const [settings, ownedClan, cosmetics] = await Promise.all([
		getUserSettings(currentUser.id),
		getOwnedClanSettings(currentUser.id),
		getProfileCosmetics(currentUser.id),
	]);
	if (!settings) redirect("/signin");
	const legacyClanSection = params.section === "clan";
	const requestedClanScope = params.scope === "clan" || legacyClanSection;
	const cannotAccessRequestedScope = requestedClanScope && !ownedClan;
	const activeScope: SettingsScope =
		requestedClanScope && ownedClan ? "clan" : "personal";
	const validSection = legacyClanSection
		? "rename"
		: normalizeSettingsSection(params.section);
	const activeSection: SettingsSection =
		cannotAccessRequestedScope ||
		(activeScope === "clan" && validSection === "appearance")
			? "rename"
			: validSection;
	const activeMeta = getSectionMeta(activeScope, activeSection);
	
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");
	const [
		[hasAvatar, hasBanner, hasBackground],
		[hasClanAvatar, hasClanBanner, hasClanBackground],
	] = await Promise.all([
		Promise.all([
			profileMediaExists("avatar", currentUser.id),
			profileMediaExists("banner", currentUser.id),
			profileMediaExists("background", currentUser.id),
		]),
		ownedClan
			? Promise.all([
				profileMediaExists("avatar", ownedClan.id, "clan"),
				profileMediaExists("banner", ownedClan.id, "clan"),
				profileMediaExists("background", ownedClan.id, "clan"),
			])
			: Promise.resolve([false, false, false] as const),
	]);
	const [
		avatarUrl,
		profileBannerUrl,
		profileBackgroundUrl,
		clanAvatarUrl,
		clanBannerUrl,
		clanBackgroundUrl,
	] = await Promise.all([
		resolveProfileAvatarUrl(currentUser.id, false, baseDomain),
		hasBanner
			? resolveProfileBannerUrl(currentUser.id, false, baseDomain)
			: Promise.resolve(null),
		hasBackground
			? resolveProfileBackgroundUrl(currentUser.id, false, baseDomain)
			: Promise.resolve(null),
		ownedClan && hasClanAvatar
			? resolveProfileAvatarUrl(ownedClan.id, true, baseDomain)
			: Promise.resolve(null),
		ownedClan && hasClanBanner
			? resolveProfileBannerUrl(ownedClan.id, true, baseDomain)
			: Promise.resolve(null),
		ownedClan && hasClanBackground
			? resolveProfileBackgroundUrl(ownedClan.id, true, baseDomain)
			: Promise.resolve(null),
	]);
	const activeClan = activeScope === "clan" ? ownedClan : null;
	const isClanScope = activeClan !== null;
	const profileHref = activeClan
		? `/profile/${activeClan.id}?clan`
		: `/profile/${currentUser.id}`;
	
	return (
		<>
			<div className={styles.page}>
				<section className={styles.hero}>
					<div className={styles.hero_glow}/>
					<div className={styles.hero_identity}>
						{isClanScope ? (
							<span
								className={`${styles.hero_avatar} ${styles.clan_hero_avatar}`}
								data-empty={clanAvatarUrl === null}
							>
                {clanAvatarUrl ? (
	                <Image
		                src={clanAvatarUrl}
		                alt={`${activeClan?.tag ?? "Clan"} clan avatar`}
		                fill
		                sizes="88px"
		                draggable={false}
		                priority
	                />
                ) : (
	                <FontAwesome prefix="fad" name="people-group"/>
                )}
              </span>
						) : (
							<PlayerAvatar
								userId={currentUser.id}
								name={settings.username}
								baseDomain={baseDomain}
								imageUrl={avatarUrl}
								cosmetics={cosmetics}
								className={styles.hero_avatar}
								sizes="88px"
								priority
							/>
						)}
						<div>
							<h1>{isClanScope ? "Clan settings" : "Account settings"}</h1>
						</div>
					</div>
					<Link className={styles.profile_link} href={profileHref}>
						{isClanScope ? "View clan" : "View profile"}
						<FontAwesome prefix="fas" name="arrow-up-right"/>
					</Link>
				</section>
				
				<div className={styles.layout}>
					<aside
						className={styles.sidebar}
						data-page-enter="box"
						aria-label="Settings sections"
					>
						<div className={styles.sidebar_heading}>
							<FontAwesome prefix="fad" name="sliders"/>
							<span>
                <strong>Settings</strong>
              </span>
						</div>
						{ownedClan && (
							<nav
								className={styles.scope_switch}
								data-scope={activeScope}
								aria-label="Settings target"
							>
								<Link
									href="/settings?scope=personal&section=rename"
									scroll={false}
									data-active={activeScope === "personal"}
									aria-current={activeScope === "personal" ? "page" : undefined}
								>
									<FontAwesome prefix="fas" name="user"/>
									Personal
								</Link>
								<Link
									href="/settings?scope=clan&section=rename"
									scroll={false}
									data-active={activeScope === "clan"}
									aria-current={activeScope === "clan" ? "page" : undefined}
								>
									<FontAwesome prefix="fas" name="people-group"/>
									Clan
								</Link>
							</nav>
						)}
						<nav
							className={styles.settings_menu}
							aria-label={isClanScope ? "Clan settings" : "Account settings"}
						>
							<Link
								href={
									isClanScope
										? "/settings?scope=clan&section=rename"
										: "/settings?scope=personal&section=rename"
								}
								scroll={false}
								data-active={activeSection === "rename"}
								aria-current={activeSection === "rename" ? "page" : undefined}
							>
								<FontAwesome prefix="fad" name="pen-to-square"/>
								Rename
							</Link>
							<Link
								href={
									isClanScope
										? "/settings?scope=clan&section=images"
										: "/settings?scope=personal&section=images"
								}
								scroll={false}
								data-active={activeSection === "images"}
								aria-current={activeSection === "images" ? "page" : undefined}
							>
								<FontAwesome prefix="fad" name="images"/>
								Profile images
							</Link>
							<Link
								href={
									isClanScope
										? "/settings?scope=clan&section=profile-conf"
										: "/settings?scope=personal&section=profile-conf"
								}
								scroll={false}
								data-active={activeSection === "profile-conf"}
								aria-current={
									activeSection === "profile-conf" ? "page" : undefined
								}
							>
								<FontAwesome prefix="fad" name="user-gear"/>
								Profile conf
							</Link>
							<Link
								href={
									isClanScope
										? "/settings?scope=clan&section=me"
										: "/settings?scope=personal&section=me"
								}
								scroll={false}
								data-active={activeSection === "me"}
								aria-current={activeSection === "me" ? "page" : undefined}
							>
								<FontAwesome prefix="fad" name="id-badge"/>
								Me!
							</Link>
							{!isClanScope && (
								<Link
									href="/settings?scope=personal&section=appearance"
									scroll={false}
									data-active={activeSection === "appearance"}
									aria-current={
										activeSection === "appearance" ? "page" : undefined
									}
								>
									<FontAwesome prefix="fad" name="palette"/>
									Appearance
								</Link>
							)}
							{!isClanScope && (
								<a
									href={`https://market.${baseDomain}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<FontAwesome prefix="fad" name="store"/>
									Badge market
									<FontAwesome
										className={styles.sidebar_external_icon}
										prefix="fas"
										name="arrow-up-right"
									/>
								</a>
							)}
						</nav>
					</aside>
					
					<div className={styles.sections}>
						<section className={styles.section_card} data-page-enter="box">
							<div className={styles.section_heading}>
                <span>
                  <FontAwesome prefix="fad" name={activeMeta.icon}/>
                </span>
								<div>
									<h2>{activeMeta.title}</h2>
								</div>
							</div>
							{!isClanScope && activeSection === "rename" && (
								<ProfileSettingsForm
									username={settings.username}
									showPastNames={settings.showPastNames}
								/>
							)}
							{!isClanScope && activeSection === "images" && (
								<div className={styles.media_settings}>
									<MediaSettingCard
										type="avatar"
										imageUrl={avatarUrl}
										hasCustomImage={hasAvatar}
									/>
									<MediaSettingCard
										type="banner"
										imageUrl={
											profileBannerUrl ??
											`https://banner.${baseDomain}/${currentUser.id}`
										}
										hasCustomImage={hasBanner}
									/>
									<MediaSettingCard
										type="background"
										imageUrl={
											profileBackgroundUrl ??
											`https://bg.${baseDomain}/${currentUser.id}`
										}
										hasCustomImage={hasBackground}
									/>
								</div>
							)}
							{activeSection === "me" && (
								<AboutMeSettingsEditor
									initialBBCode={activeClan?.aboutMe ?? settings.aboutMe}
									profileId={activeClan?.id ?? currentUser.id}
									isClan={isClanScope}
								/>
							)}
							{activeClan && activeSection === "rename" && (
								<ClanSettingsForm
									tag={activeClan.tag}
									showPastTags={activeClan.showPastTags}
								/>
							)}
							{activeSection === "profile-conf" && (
								<ThemeSettingsForm
									initialTheme={
										activeClan ? activeClan.profileTheme : settings.profileTheme
									}
									initialHue={
										activeClan ? activeClan.profileHue : settings.profileHue
									}
									initialIsPrivate={
										activeClan ? activeClan.isPrivate : settings.isPrivate
									}
									initialUseWebsiteAppearance={
										activeClan ? undefined : settings.useWebsiteAppearance
									}
									websiteTheme={activeClan ? undefined : settings.webTheme}
									websiteHue={activeClan ? undefined : settings.webHue}
									scope={activeScope}
								/>
							)}
							{!isClanScope && activeSection === "appearance" && (
								<ThemeSettingsForm
									initialTheme={settings.webTheme}
									initialHue={settings.webHue}
								/>
							)}
							{activeClan && activeSection === "images" && (
								<div className={styles.media_settings}>
									<MediaSettingCard
										type="avatar"
										imageUrl={clanAvatarUrl ?? ""}
										hasCustomImage={hasClanAvatar}
										scope="clan"
									/>
									<MediaSettingCard
										type="banner"
										imageUrl={
											clanBannerUrl ??
											`https://clan-banner.${baseDomain}/${activeClan.id}`
										}
										hasCustomImage={hasClanBanner}
										scope="clan"
									/>
									<MediaSettingCard
										type="background"
										imageUrl={
											clanBackgroundUrl ??
											`https://clan-bg.${baseDomain}/${activeClan.id}`
										}
										hasCustomImage={hasClanBackground}
										scope="clan"
									/>
								</div>
							)}
						</section>
					</div>
				</div>
			</div>
			<NameBodyHeader className="settings"/>
		</>
	);
}
