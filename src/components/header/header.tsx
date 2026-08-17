import Link from "next/link";
import Image from "next/image";
import FontAwesome from "@/components/font-awesome";
import PageTitle from "./page-title";
import ArrowChevron from "./arrow";
import UserContainer from "./user-container";
import ScrollMotion from "./scroll-motion";
import { HeaderSearchProvider } from "@/components/context/header-search-provider";
import HeaderSearch, { HeaderSearchTrigger } from "./search";

export default function Header() {
	return (
		<HeaderSearchProvider>
			<div data-site-header role="banner">
				<nav className="top-bar">
				<Link className="top" href="/">
					<Image src="/images/logo.png" alt="Mamestagram logo" fill sizes="(max-width: 768px) 100vw, 50vw" draggable={false} priority/>
				</Link>
				<PageTitle/>
				<div className="donation">
					<Link title="Support us!" href="/support">
						<FontAwesome prefix="fas" name="heart"/>
					</Link>
				</div>
				<HeaderSearchTrigger location="top"/>
				<ArrowChevron/>
				</nav>
				<nav className="navigation">
				<ul>
					<li className="leaderboard">
						<span className="pipe"></span>
						<Link href="/leaderboard/std/performance">Leaderboard</Link>
					</li>
					<li className="documents">
						<span className="pipe"></span>
						<Link href="/documents">Documents</Link>
					</li>
					<li className="patcher">
						<Link href="/lazer">Lazer</Link>
					</li>
					<li className="community">
						<a href="https://discord.com/invite/xqncGVrHSf"
						   target="_blank"
						   rel="noopener noreferrer">
							Community
						</a>
					</li>
					<li className="report">
						<a href={`https://report.${process.env.BASE_DOMAIN}/`}
						   target="_blank"
						   rel="noopener noreferrer">
							Report
						</a>
					</li>
					<li className="donation">
						<Link title="Support us!" href="/support">
							<FontAwesome prefix="fas" name="heart"/>
						</Link>
					</li>
					<HeaderSearchTrigger location="navigation"/>
					<UserContainer/>
				</ul>
				</nav>
				<ScrollMotion/>
			</div>
			<HeaderSearch/>
		</HeaderSearchProvider>
	);
}
