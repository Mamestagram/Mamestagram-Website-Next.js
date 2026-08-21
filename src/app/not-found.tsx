import type { Metadata } from "next";
import Link from "next/link";
import FontAwesome from "@/components/font-awesome";
import NameBodyHeader from "@/components/name-body-header";
import styles from "@s/not-found.module.css";

export const metadata: Metadata = {
	title: "Page not found",
	robots: { index: false, follow: false }
};

export default function NotFound() {
	return (
		<>
			<section className={styles.page} aria-labelledby="not-found-title">
				<div className={styles.glow} aria-hidden="true"/>
				<div className={styles.card} data-page-enter="box">
					<p className={styles.code} aria-label="Error 404">
						<span>4</span>
						<span className={styles.disc} aria-hidden="true">
							<FontAwesome prefix="fad" name="compact-disc"/>
						</span>
						<span>4</span>
					</p>
					<p className={styles.eyebrow}>PAGE NOT FOUND</p>
					<h1 id="not-found-title">Something went wrong.</h1>
					<p className={styles.description}>
						The page may have moved, been removed, or the address might be incorrect.
					</p>
					<nav className={styles.actions} aria-label="Not found actions">
						<Link className={styles.primary_action} href="/">
							Back to dashboard
							<FontAwesome prefix="fas" name="arrow-right"/>
						</Link>
						<Link className={styles.secondary_action} href="/search/players">
							<FontAwesome prefix="fas" name="magnifying-glass"/>
							Search Mamestagram
						</Link>
					</nav>
				</div>
			</section>
			<NameBodyHeader className="not-found"/>
		</>
	);
}
