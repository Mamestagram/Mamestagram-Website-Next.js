import Link from "next/link";
import Image from "next/image";
import FontAwesome from "@/components/font-awesome";
import PageTitle from "./page-title";
import ArrowChevron from "./arrow";
import UserContainer from "./user-container";
import ScrollMotion from "./scroll-motion";

export default function Header() {
	return (
		<header>
			<nav className="top-bar">
				<Link className="top" href="/">
					<Image src="/images/logo.png" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" priority/>
				</Link>
				<PageTitle/>
				<div className="donation">
					<a title="Support us!"
					   href="/support"
					   target="_blank"
					   rel="noopener noreferrer">
						<FontAwesome prefix="fas" name="heart"/>
					</a>
				</div>
				<div className="search">
					<FontAwesome prefix="fas" name="magnifying-glass"/>
				</div>
				<ArrowChevron/>
			</nav>
			<nav className="navigation">
				<ul>
					<li className="leaderboard">
						<span className="pipe"></span>
						<Link href="/leaderboard">Leaderboard</Link>
					</li>
					<li className="documents">
						<span className="pipe"></span>
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
					<UserContainer/>
				</ul>
			</nav>
			<ScrollMotion/>
		</header>
	);
}