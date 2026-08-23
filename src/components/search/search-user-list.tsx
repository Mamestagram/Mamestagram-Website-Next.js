"use client";

import Link from "next/link";
import CountryFlag from "@/components/country-flag";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import PlayerAvatar from "@/components/player-avatar";
import { modeAbbreviation, type ModeNum } from "@/lib/mode";
import { Priv } from "@/lib/priv";
import type { SearchUser } from "@/lib/search";
import styles from "@s/header-search.module.css";

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

export default function SearchUserList({ items: users, baseDomain, onSelect }: Readonly<{
	items: SearchUser[],
	baseDomain: string,
	onSelect?: () => void
}>) {
	return (
		<ul className={styles.result_list}>
			{users.map((user) => {
				const privileges = getPrivilegeMeta(user.privileges);
				const primaryPrivilege = privileges.at(-1);
				return (
					<li key={user.id} data-rendering-item="compact">
						<Link className={styles.player_result}
						      href={`/profile/${user.id}`}
						      onClick={onSelect}>
							<PlayerAvatar userId={user.id}
							              name={user.name}
							              baseDomain={baseDomain}
							              cosmetics={user.cosmetics}
							              className={styles.avatar}
							              sizes="(max-width: 600px) 44px, 48px"/>
							<span className={styles.identity}>
								<span className={styles.name_with_tooltip}>
									<strong>{user.name}</strong>
									<span className={styles.name_tooltip} role="tooltip">{user.name}</span>
								</span>
								<small>Player #<FormattedNumber value={user.id}/></small>
							</span>
							<span className={styles.meta}>
								<span className={styles.meta_primary}>
									<small className={styles.country}>
										<CountryFlag code={user.country.toLowerCase()}/>
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
