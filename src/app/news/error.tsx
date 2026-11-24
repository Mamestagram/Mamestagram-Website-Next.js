"use client";

import Link from "next/link";
import NameBodyHeader from "@/components/name-body-header";
import styles from "@s/news.module.css";

export default function NewsError({ reset }: Readonly<{ reset: () => void }>) {
	return <>
		<NameBodyHeader className="news"/>
		<section className={styles.page}>
			<h1>News is temporarily unavailable</h1>
			<p className={styles.notice}>We couldn’t load this article. Please try again.</p>
			<div className={styles.actions}>
				<button type="button" onClick={reset}>Try again</button>
				<Link className={styles.back_link} href="/news">Back to news</Link>
			</div>
		</section>
	</>;
}
