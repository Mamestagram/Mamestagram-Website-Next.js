import Image from "next/image";
import Link from "next/link";
import { getClanMembers } from "@/database/profile";
import { ModeNum, type OsuMode } from "@/lib/mode";
import CountryFlag from "@/components/country-flag";
import FontAwesome from "@/components/font-awesome";
import KickClanMemberButton from "@/components/profile/kick-clan-member-button";
import styles from "@s/profile.module.css";

export default async function ClanMembers({ clanId, mode, isDans, canManage }: {
	clanId: number,
	mode: OsuMode,
	isDans: boolean,
	canManage: boolean
}) {
	const members = await getClanMembers(clanId, ModeNum[mode], isDans);
	const profileQuery = isDans ? "?dans" : "";

	return (
		<section className={styles.clan_members}>
			<div className={styles.clan_member_grid_header}>
				<h2>
					<FontAwesome prefix="fad" name="people-group"/>
					Clan Members
				</h2>
				<strong>{members.length.toLocaleString()}</strong>
			</div>
			{members.length > 0
				? <ul className={styles.clan_member_grid}>
						{members.map((member) => {
							const countryCode = member.country.trim().toLowerCase();
							const hasCountry = /^[a-z]{2}$/.test(countryCode);
							const role = member.isOwner
								? { label: "Owner", icon: "crown" }
								: { label: "Member", icon: "user" };
							return (
								<li key={member.id} className={styles.clan_member_grid_item}>
									<Link className={styles.clan_member_card}
									      href={`/profile/${member.id}/${mode}${profileQuery}`}>
										<span className={styles.clan_member_grid_avatar}>
											<Image src={`https://a.${process.env.BASE_DOMAIN}/${member.id}`}
											       alt=""
											       fill
											       sizes="38px"
											       draggable={false}/>
										</span>
										<span className={styles.clan_member_grid_copy}>
											<span className={styles.clan_member_grid_name}>
								{hasCountry
									? <CountryFlag code={countryCode} escapeOverflow/>
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
