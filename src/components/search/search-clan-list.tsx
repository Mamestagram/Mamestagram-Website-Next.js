"use client";

import Image from "next/image";
import Link from "next/link";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import { appendAvatarQueryMarker } from "@/lib/avatar-url";
import { modeAbbreviation, type ModeNum } from "@/lib/mode";
import type { SearchClan } from "@/lib/search";
import styles from "@s/header-search.module.css";

export default function SearchClanList({ items: clans, baseDomain, onSelect }: Readonly<{
	items: SearchClan[],
	baseDomain: string,
	onSelect?: () => void
}>) {
	return (
		<ul className={styles.result_list}>
			{clans.map((clan) =>
				<li key={clan.id} data-rendering-item="compact">
					<Link href={`/profile/${clan.id}?clan`} onClick={onSelect}>
						<span className={styles.avatar}>
							<FontAwesome className={styles.avatar_fallback} prefix="fad" name="people-group"/>
							<Image src={appendAvatarQueryMarker(`https://clan-a.${baseDomain}/${clan.id}`)}
							       alt={`${clan.name} clan avatar`}
							       fill
							       sizes="48px"
							       draggable={false}
							       onError={(event) => {
								       event.currentTarget.hidden = true;
							       }}/>
						</span>
						<span className={styles.identity}>
							<span className={styles.name_with_tooltip}>
								<strong>{clan.tag}</strong>
								<span className={styles.name_tooltip} role="tooltip">{clan.tag}</span>
							</span>
							<small>Clan #<FormattedNumber value={clan.id}/></small>
						</span>
						<span className={styles.meta}>
							<span className={styles.meta_primary}>
								<small>{modeAbbreviation(clan.preferredMode as ModeNum)}</small>
								<small title={`${clan.memberCount.toLocaleString("en-US")} members`}>
									<FontAwesome prefix="fas" name="users"/> <FormattedNumber value={clan.memberCount}/>
								</small>
							</span>
						</span>
						<FontAwesome className={styles.open_icon} prefix="fas" name="chevron-right"/>
					</Link>
				</li>)}
		</ul>
	);
}
