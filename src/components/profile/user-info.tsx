import classNames from "classnames";
import Image from "next/image";
import { Profile } from "@/database/profile";
import style from "@s/profile.module.css";

export default function UserInfo({ id, info }: {
	id: number,
	info: Profile,
}) {
	return (
		<div className={classNames(style.section_box, style.user_info)}>
			<div>
				<div className="userinfo-top">
					<div className="avatar">
						<Image src={`https://a.${process.env.BASE_DOMAIN}/${id}`} fill sizes="(max-width: 768px) 100vw, 50vw" alt="" priority/>
					</div>
					<div>
						<div className="name">{info.tag}{info.name}</div>
						<div className="sub">
							Rhythm game player / mapper / community builder<br/>
							Short bio, status message, and a stronger first impression area.
						</div>
					</div>
				</div>
				
				<div className="userinfo-meta">
					<div className="pill">Japan</div>
					<div className="pill">osu!std Main</div>
					<div className="pill">Mapper</div>
					<div className="pill">Clan: Mamestagram</div>
				</div>
				
				<div className="social-strip">
					<div className="social-box">
						<div className="social-label">Mutual</div>
						<div className="social-value">{info.mutual!.length}</div>
					</div>
					<div className="social-box">
						<div className="social-label">Following</div>
						<div className="social-value">{info.following!.length}</div>
					</div>
					<div className="social-box">
						<div className="social-label">Followers</div>
						<div className="social-value">{info.followers!.length}</div>
					</div>
				</div>
				
				<div className="last-online">
					<div className="last-online-label">Last Online</div>
					<div className="last-online-value">2026/04/22 08:43 JST</div>
				</div>
			</div>
		</div>
	);
}