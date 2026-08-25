import Link from "next/link";
import type { ClanMember } from "@/database/profile";
import type { OsuMode } from "@/lib/mode";
import FloatingCountryFlag from "@/components/floating-country-flag";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import PlayerAvatar from "@/components/player-avatar";
import KickClanMemberButton from "@/components/profile/kick-clan-member-button";
import styles from "@s/profile.module.css";

const getRoleMeta = (member: ClanMember) => {
	if (member.isOwner) return { label: "Owner", icon: "crown" };
	if (member.rank.toLowerCase() === "officer") return { label: "Officer", icon: "shield-halved" };
	return { label: member.rank || "Member", icon: "user" };
};

export default function ClanMembers({ clanId, members, mode, isDans, canManage, baseDomain }: {
	clanId: number,
	members: ClanMember[],
	mode: OsuMode,
	isDans: boolean,
	canManage: boolean,
	baseDomain: string
}) {
	const profileQuery = isDans ? "?dans" : "";
	
	return (
		<section className={styles.clan_members}>
			<div className={styles.clan_member_grid_header}>
				<h2>
					<FontAwesome prefix="fad" name="people-group"/>
					Clan Members
				</h2>
				<strong><FormattedNumber value={members.length}/></strong>
			</div>
			{members.length > 0
				? <ul className={styles.clan_member_grid}>
					{members.map((member) => {
						const countryCode = member.country.trim().toLowerCase();
						const hasCountry = /^[a-z]{2}$/.test(countryCode);
						const role = getRoleMeta(member);
						return (
							<li key={member.id}
							    className={styles.clan_member_grid_item}
							    data-rendering-item="compact">
								<Link className={styles.clan_member_card}
								      href={`/profile/${member.id}/${mode}${profileQuery}`}>
									<PlayerAvatar userId={member.id}
									              name={member.name}
									              baseDomain={baseDomain}
									              cosmetics={member.cosmetics}
									              className={styles.clan_member_grid_avatar}
									              sizes="38px"/>
									<span className={styles.clan_member_grid_copy}>
											<span className={styles.clan_member_grid_name}>
								{hasCountry
									? <FloatingCountryFlag code={countryCode}/>
									: <FontAwesome prefix="fas" name="globe"/>}
												<strong>{member.name}</strong>
											</span>
											<small>
												<FontAwesome prefix="fas" name={role.icon}/>
												{role.label}
											</small>
										</span>
								</Link>
								{canManage && !member.isOwner &&
									<KickClanMemberButton clanId={clanId}
									                      memberId={member.id}
									                      memberName={member.name}
									                      mode={mode}/>}
							</li>
						);
					})}
				</ul>
				: <div className={styles.no_clan_members} role="status">
					<FontAwesome prefix="fad" name="user-slash"/>
					<strong>No members found</strong>
				</div>}
		</section>
	);
}
