import type { Metadata } from "next";
import Link from "next/link";
import FontAwesome from "@/components/font-awesome";
import HomeUpdatesEditor from "@/components/home/home-updates-editor";
import NameBodyHeader from "@/components/name-body-header";
import NewsList from "@/components/news-list";
import { getHomeUpdates, HomeUpdatesSchemaError } from "@/database/home-updates";
import type { HomeUpdatesPage } from "@/lib/home-updates";
import { writeError, writeLog } from "@/lib/log";
import { getNewsHref, parseNewsId } from "@/lib/news";
import { hasDeveloperAccess } from "@/lib/priv";
import { getCurrentUser } from "@/lib/session";
import styles from "@s/news.module.css";

export const metadata: Metadata = {
	title: "News",
	description: "The latest Mamestagram updates, improvements and fixes.",
};

export default async function NewsPage({ searchParams }: Readonly<{
	searchParams: Promise<{ category?: string | string[]; before?: string | string[] }>;
}>) {
	const { category: requestedCategory, before: requestedBefore } = await searchParams;
	const category = requestedCategory === "updates" || requestedCategory === "fix" ? requestedCategory : null;
	const before = parseNewsId(requestedBefore);
	const user = await getCurrentUser();
	const canEdit = user.isLoggedIn && hasDeveloperAccess(user.priv);
	let page: HomeUpdatesPage = { items: [], nextCursor: null };
	let unavailable: string | null = null;
	try {
		page = await getHomeUpdates(before ?? undefined, category);
	} catch (error: unknown) {
		if (!(error instanceof HomeUpdatesSchemaError)) void writeError(error, { source: "server", pathname: "/news", routeType: "news" });
		unavailable = canEdit && error instanceof HomeUpdatesSchemaError ? error.message : "News is temporarily unavailable. Please try again later.";
	}
	void writeLog("GET", "/news");
	const heading = <h2 className={styles.list_title}>{category === "updates" ? "Updates" : category === "fix" ? "Fixes" : "Latest news"}</h2>;
	return <>
		<NameBodyHeader className="news"/>
		<div className={styles.page}>
			<section className={styles.intro}>
				<Link className={styles.back_link} href="/home"><FontAwesome prefix="fas" name="arrow-left"/> Dashboard</Link>
				<p className={styles.eyebrow}>Mamestagram</p>
				<h1>News</h1>
				<p className={styles.description}>Updates, improvements and a look at what’s new.</p>
			</section>
			<nav className={styles.filters} aria-label="News categories">
				<Link href="/news" aria-current={category === null ? "page" : undefined}>All news</Link>
				<Link href={getNewsHref("updates")} aria-current={category === "updates" ? "page" : undefined}>Update</Link>
				<Link href={getNewsHref("fix")} aria-current={category === "fix" ? "page" : undefined}>Fix</Link>
			</nav>
			<section className={styles.feed}>
				{canEdit ? <HomeUpdatesEditor page={page} unavailable={unavailable} heading={heading} presentation="news"/> : <>
					{heading}
					{unavailable ? <p className={styles.notice} role="status">{unavailable}</p> : <NewsList items={page.items}/>}
				</>}
			</section>
			{!unavailable && (before !== null || page.nextCursor !== null) && <nav className={styles.pagination} aria-label="News pages">
				{before !== null && <Link href={getNewsHref(category)}><FontAwesome prefix="fas" name="arrow-left"/> Latest news</Link>}
				{page.nextCursor !== null && <Link href={getNewsHref(category, page.nextCursor)}>Older posts <FontAwesome prefix="fas" name="arrow-right"/></Link>}
			</nav>}
		</div>
	</>;
}
