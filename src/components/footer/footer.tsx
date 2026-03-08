export default function Footer() {
	return (
		<footer>
			<nav className="navigation">
				<div className="section mamestagram">
					<h3>Mamestagram</h3>
					<p style="color: var(--text-sub); font-size: 14px; line-height: 1.6;">
						The next-generation rhythm game experience.<br/>Click circles, to the beat!
					</p>
				</div>
				<div className="section ">
					<h3>Explore</h3>
					<ul className="footer-links">
						<li><a href="#">Beatmaps</a></li>
						<li><a href="#">Leaderboard</a></li>
						<li><a href="#">Tournaments</a></li>
						<li><a href="#">Wiki & Guides</a></li>
					</ul>
				</div>
				<div className="section ">
					<h3>Support & Legal</h3>
					<ul className="footer-links">
						<li><a href="#">Terms of Service</a></li>
						<li><a href="#">Privacy Policy</a></li>
						<li><a href="#">Rules</a></li>
						<li><a href="#">Contact Us</a></li>
					</ul>
				</div>
			</nav>
			<div className="footer-bottom">
				<p>2023 - 2025 Mamestagram, designed by basshhii0610 X</p>
				<p>Ethereal Glass Theme</p>
			</div>
		</footer>
	);
}