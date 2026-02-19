import Link from "next/link";
import Image from "next/image";
import FontAwesome from "@/components/font-awesome";
import UserHeader from "./user";
import HeaderMotion from "./motion";
import styles from "@s/common/header.module.css";

export default function Header() {
	return (
		<header>
			<Link className={styles.top} href="/">
				<Image src="/images/logo.webp" alt="" fill priority/>
			</Link>
			<nav className={styles.navigation}>
				<ul>
					<li className="leaderboard">
						<Link href="/leaderboard/std/performance">Leaderboard</Link>
					</li>
					<li className="documents">
						<Link href="/documents">Documents</Link>
					</li>
					<li className="community">
						<a href="https://discord.com/invite/xqncGVrHSf"
						   target="_blank"
						   rel="noopener noreferrer">
							Community
						</a>
					</li>
					<li className={styles.donation}>
						<a title="Support us!"
						   href="https://ko-fi.com/mamestagram/tiers"
						   target="_blank"
						   rel="noopener noreferrer">
							<FontAwesome prefix="fas" name="heart"/>
						</a>
					</li>
					<li className={styles.search}>
						<FontAwesome prefix="fas" name="magnifying-glass"/>
					</li>
					<UserHeader/>
				</ul>
			</nav>
			<HeaderMotion/>
		</header>
	);
}