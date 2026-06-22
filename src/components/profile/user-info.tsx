import classNames from "classnames";
import Image from "next/image";
import type { Profile } from "@/database/profile";
import { modeAbbreviation } from "@/lib/mode";
import { Priv } from "@/lib/priv";
import CountryFlag from "@/components/country-flag";
import styles from "@s/profile.module.css";

export default function UserInfo({ id, info }: {
	id: number,
	info: Profile,
}) {
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
					<h1 className={styles.name}>{info.tag}{info.name}</h1>
					{info.showPastName && info.pastNames !== null &&
						<p className={styles.past_names}>aka: {info.pastNames}</p>}
				</span>
			</div>
			
			<ul className={styles.meta}>
				<li className={styles.country}>
					<CountryFlag className={styles.flag} code={info.country} />
					{(new Intl.DisplayNames(["en"], { type: "region" })).of(info.country.toUpperCase())}
				</li>
				<li>{modeAbbreviation(info.preferredMode)} main</li>
				{info.priv.map((tag, i) => {
					switch (tag) {
						case Priv.verified: return <li key={i}>Verified user</li>;
						case Priv.supporter: return <li key={i}>Mamestagram supporter</li>;
						case Priv.nominator: return <li key={i}>Nominator</li>;
						case Priv.moderator: return <li key={i}>Moderator</li>;
						case Priv.administrator: return <li key={i}>Administrator</li>;
						case Priv.developer:
						case Priv.staff:
							return <li key={i}>Developer</li>;
					}
				})}
			</ul>
			
			<ul className={styles.social_strip}>
				<li>
					<h1 >Mutual</h1>
					<p>{info.mutual.length}</p>
				</li>
				<li>
					<h1>Following</h1>
					<p>{info.following.length}</p>
				</li>
				<li>
					<h1>Followers</h1>
					<p>{info.followers.length}</p>
				</li>
			</ul>
			
			<span className={styles.last_online}>
				<h1>Last Online</h1>
				<p>
					{info.latestActivity.toLocaleString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
						second: "2-digit",
						timeZone: "UTC",
						timeZoneName: "short"
					})}
				</p>
			</span>
		</div>
	);
}