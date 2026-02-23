import Link from "next/link";
import Image from "next/image";
import FontAwesome from "@/components/font-awesome";
import UserHeader from "./user";
import HeaderMotion from "./motion";
import styles from "@s/common/header.module.css";

export default function Header() {
	return (
		<header>
			<Link className="top" href="/">
				<Image src="/images/logo.png" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" priority/>
			</Link>
			<nav className="navigation">
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
					<li className="donation">
						<a title="Support us!"
						   href="/support"
						   target="_blank"
						   rel="noopener noreferrer">
							<FontAwesome prefix="fas" name="heart"/>
						</a>
					</li>
					<li className="search">
						<FontAwesome prefix="fas" name="magnifying-glass"/>
					</li>
					<UserHeader/>
				</ul>
			</nav>
			<HeaderMotion/>
		</header>
	);
}