import Link from "next/link";
import FontAwesome from "@/components/font-awesome";

export default function Footer() {
	return (
		<footer>
			<nav className="navigation">
				<div className="section mamestagram">
					<h2>Mamestagram</h2>
					<p>A community-driven osu! private server with leaderboards, player profiles, and custom
						features.</p>
				</div>
				<div className="section explore">
					<h2>Explore</h2>
					<ul>
						<li className="home">
							<Link href="/">Home</Link>
						</li>
						<li className="leaderboard">
							<Link href="/leaderboard">Leaderboard</Link>
						</li>
						<li className="documents">
							<Link href="/documents">Documents</Link>
						</li>
						<li className="community-server">
							<a href="https://discord.com/invite/xqncGVrHSf"
							   target="_blank"
							   rel="noopener noreferrer">
								Community Server
							</a>
						</li>
						<li className="status">
							<a href={`https://c.${process.env.BASE_DOMAIN}`}
							   target="_blank"
							   rel="noopener noreferrer">
								Status
							</a>
						</li>
					</ul>
				</div>
				<div className="section support-legal">
					<h2>Support & Legal</h2>
					<ul>
						<li className="faq">
							<Link href="/documents#faq">FAQ</Link>
						</li>
						<li className="rules">
							<Link href="/documents#rules">Rules</Link>
						</li>
						<li className="player-report">
							<a href={`https://report.${process.env.BASE_DOMAIN}`}
							   target="_blank"
							   rel="noopener noreferrer">
								Report a player
							</a>
						</li>
					</ul>
				</div>
			</nav>
			<div className="bottom">
				<p>
					2023 - {(new Date()).getUTCFullYear()} Mamestagram
					<a className="github"
					   href="https://github.com/Mamestagram"
					   target="_blank"
					   rel="noopener noreferrer">
						<FontAwesome prefix="fab" name="github"/>
					</a>
					<a className="youtube"
					   href="https://www.youtube.com/@Mamestagram"
					   target="_blank"
					   rel="noopener noreferrer">
						<FontAwesome prefix="fab" name="youtube"/>
					</a>
				</p>
				<p className="built-with">
					Designed by basshhii0610
					<a className="x-twitter"
					   href="https://x.com/basshhii_0610"
					   target="_blank"
					   rel="noopener noreferrer">
						<FontAwesome prefix="fab" name="x-twitter"/>
					</a>, Code assisted by
					<FontAwesome prefix="fab" name="openai"/>
					OpenAI Codex
				</p>
			</div>
		</footer>
	);
}
