import classNames from "classnames";
import style from "@s/profile.module.css";

export default function UserInfo() {
	return (
		<div className={classNames(style.section_box, style.user_info)}>
			<div>
				<div className="userinfo-top">
					<div className="avatar"></div>
					<div>
						<div className="name">Mame</div>
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
						<div className="social-value">128</div>
					</div>
					<div className="social-box">
						<div className="social-label">Following</div>
						<div className="social-value">412</div>
					</div>
					<div className="social-box">
						<div className="social-label">Followers</div>
						<div className="social-value">587</div>
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