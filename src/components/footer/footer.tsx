import Link from "next/link";
import FontAwesome from "@/components/font-awesome";

export default function Footer() {
	return (
		<footer>
			<nav className="navigation">
				<div className="section mamestagram">
					<h2>Mamestagram</h2>
					<p>
						The next-generation rhythm game experience.<br/>
						Click circles, to the beat!
					</p>
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
						<li className="bug-report">
							<a href="https://discord.com/channels/944248031136587796/1117062398596108298"
							   target="_blank"
							   rel="noopener noreferrer">
								Report a bug
							</a>
						</li>
						<li className="ticket">
							<a href="https://discord.com/channels/944248031136587796/1171728223407710208"
							   target="_blank"
							   rel="noopener noreferrer">
								Open a ticket
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
					</a>, designed by basshhii0610
					<a className="x-twitter"
					   href="https://x.com/basshhii_0610"
					   target="_blank"
					   rel="noopener noreferrer">
						<FontAwesome prefix="fab" name="x-twitter"/>
					</a>
				</p>
				<p className="built-with">
					Built with <FontAwesome prefix="fab" name="openai"/>OpenAI Codex
				</p>
			</div>
		</footer>
	);
}
