"use client";

import Image from "next/image";
import Link from "next/link";
import FontAwesome from "@/components/font-awesome";
import { BeatmapStatus } from "@/lib/beatmap-status";
import { modeAbbreviation, type ModeNum } from "@/lib/mode";
import { Priv } from "@/lib/priv";
import type { SearchBeatmap, SearchClan, SearchUser } from "@/lib/search";
import styles from "@s/header-search.module.css";

const beatmapStatusLabels: Record<number, string> = {
	[BeatmapStatus.notSubmitted]: "Not submitted",
	[BeatmapStatus.graveyard]: "Graveyard",
	[BeatmapStatus.updateAvailable]: "Pending update",
	[BeatmapStatus.ranked]: "Ranked",
	[BeatmapStatus.approved]: "Approved",
	[BeatmapStatus.qualified]: "Qualified",
	[BeatmapStatus.loved]: "Loved"
};

const privilegeMeta: Partial<Record<Priv, { label: string, icon: string }>> = {
	[Priv.whitelisted]: { label: "Verified", icon: "badge-check" },
	[Priv.supporter]: { label: "Supporter", icon: "heart" },
	[Priv.premium]: { label: "Premium", icon: "gem" },
	[Priv.alumni]: { label: "Alumni", icon: "graduation-cap" },
	[Priv.tourneyManager]: { label: "Tournament Manager", icon: "trophy" },
	[Priv.nominator]: { label: "Nominator", icon: "pen-nib" },
	[Priv.moderator]: { label: "Moderator", icon: "shield-halved" },
	[Priv.administrator]: { label: "Administrator", icon: "user-shield" },
	[Priv.developer]: { label: "Developer", icon: "code" }
};

const getPrivilegeMeta = (privileges: number[]) => privileges.flatMap((privilege) => {
	const meta = privilegeMeta[privilege as Priv];
	return meta ? [meta] : [];
});

type ResultListProps<T> = Readonly<{
	items: T[],
	onSelect?: () => void
}>;

export function SearchUserList({ items: users, baseDomain, onSelect }: ResultListProps<SearchUser> & Readonly<{
	baseDomain: string
}>) {
	return (
		<ul className={styles.result_list}>
			{users.map((user) => {
				const privileges = getPrivilegeMeta(user.privileges);
				const primaryPrivilege = privileges.at(-1);
				return (
					<li key={user.id}>
						<Link href={`/profile/${user.id}`} onClick={onSelect}>
							<span className={styles.avatar}>
								<Image src={`https://a.${baseDomain}/${user.id}`}
								       alt=""
								       fill
								       sizes="48px"
								       draggable={false}/>
							</span>
							<span className={styles.identity}>
								<span className={styles.name_with_tooltip}>
									<strong>{user.name}</strong>
									<span className={styles.name_tooltip} role="tooltip">{user.name}</span>
								</span>
								<small>Player #{user.id.toLocaleString("en-US")}</small>
							</span>
							<span className={styles.meta}>
								<span className={styles.meta_primary}>
									<small className={styles.country}>
										<i className={`fi fi-${user.country.toLowerCase()}`}></i>
										{user.country.toUpperCase()}
									</small>
									<small>{modeAbbreviation(user.preferredMode as ModeNum)}</small>
								</span>
								{primaryPrivilege &&
									<small className={styles.privilege}
									       title={privileges.map(({ label }) => label).join(", ")}>
										<FontAwesome prefix="fas" name={primaryPrivilege.icon}/>
										{primaryPrivilege.label}
									</small>}
							</span>
							<FontAwesome className={styles.open_icon} prefix="fas" name="chevron-right"/>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}

export function SearchClanList({ items: clans, baseDomain, onSelect }: ResultListProps<SearchClan> & Readonly<{
	baseDomain: string
}>) {
	return (
		<ul className={styles.result_list}>
			{clans.map((clan) =>
				<li key={clan.id}>
					<Link href={`/profile/${clan.id}?clan`} onClick={onSelect}>
						<span className={styles.avatar}>
							<FontAwesome className={styles.avatar_fallback} prefix="fad" name="people-group"/>
							<Image src={`https://clan-a.${baseDomain}/${clan.id}`}
							       alt=""
							       fill
							       sizes="48px"
							       draggable={false}
							       onError={(event) => { event.currentTarget.hidden = true; }}/>
						</span>
						<span className={styles.identity}>
							<span className={styles.name_with_tooltip}>
								<strong>{clan.name}</strong>
								<span className={styles.name_tooltip} role="tooltip">{clan.name}</span>
							</span>
							<small>[{clan.tag}] · Clan #{clan.id.toLocaleString("en-US")}</small>
						</span>
						<span className={styles.meta}>
							<span className={styles.meta_primary}>
								<small>{modeAbbreviation(clan.preferredMode as ModeNum)}</small>
								<small title={`${clan.memberCount.toLocaleString("en-US")} members`}>
									<FontAwesome prefix="fas" name="users"/> {clan.memberCount.toLocaleString("en-US")}
								</small>
							</span>
						</span>
						<FontAwesome className={styles.open_icon} prefix="fas" name="chevron-right"/>
					</Link>
				</li>)}
		</ul>
	);
}

export function SearchBeatmapList({ items: beatmaps, onSelect }: ResultListProps<SearchBeatmap>) {
	return (
		<ul className={styles.beatmap_result_list}>
			{beatmaps.map((beatmap) =>
				<li key={`${beatmap.setId}-${beatmap.id}`}>
					<Link href={`/beatmaps/${beatmap.setId}/${beatmap.id}`} onClick={onSelect}>
						<span className={styles.beatmap_cover}>
							<Image src={`https://assets.ppy.sh/beatmaps/${beatmap.setId}/covers/list@2x.jpg`}
							       alt=""
							       fill
							       sizes="76px"
							       draggable={false}/>
						</span>
						<span className={styles.beatmap_identity}>
							<strong title={beatmap.title}>{beatmap.title}</strong>
							<small title={`${beatmap.artist} · ${beatmap.creator}`}>
								{beatmap.artist} <span>by {beatmap.creator}</span>
							</small>
							<span title={beatmap.version}>{beatmap.version}</span>
						</span>
						<span className={styles.beatmap_meta}>
							<small>{modeAbbreviation(beatmap.mode as ModeNum)}</small>
							<small>{beatmap.difficulty.toFixed(2)}★</small>
							<small>{beatmapStatusLabels[beatmap.status] ?? "Unknown"}</small>
						</span>
						<FontAwesome className={styles.open_icon} prefix="fas" name="chevron-right"/>
					</Link>
				</li>)}
		</ul>
	);
}
