import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FontAwesome from "@/components/font-awesome";
import Markdown from "@/components/markdown";
import NameBodyHeader from "@/components/name-body-header";
import { getNewsArticle } from "@/database/home-updates";
import { writeLog } from "@/lib/log";
import { getNewsExcerpt, getNewsHref, parseNewsId } from "@/lib/news";
import styles from "@s/news.module.css";

type ArticlePageProps = Readonly<{ params: Promise<{ id: string }> }>;

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
	const id = parseNewsId((await params).id);
	if (id === null) notFound();
	const article = await getNewsArticle(id);
	if (!article) notFound();
	const title = `${article.title} | News`;
	const description = getNewsExcerpt(article.contents);
	const url = process.env.BASE_URL ? new URL(`/news/${article.id}`, process.env.BASE_URL).href : undefined;
	return { title, description, openGraph: { title, description, type: "article", url } };
}

export default async function NewsArticlePage({ params }: ArticlePageProps) {
	const id = parseNewsId((await params).id);
	if (id === null) notFound();
	const article = await getNewsArticle(id);
	if (!article) notFound();
	void writeLog("GET", `/news/${id}`);
	return <>
		<NameBodyHeader className="news"/>
		<div className={`${styles.page} ${styles.article_page}`}>
			<Link className={styles.back_link} href="/news"><FontAwesome prefix="fas" name="arrow-left"/> All news</Link>
			<article className={styles.article}>
				<div className={styles.article_heading}>
					<div className={styles.meta}>
						<Link className={styles.category} href={getNewsHref(article.category)} data-category={article.category}>{article.category === "updates" ? "Update" : "Fix"}</Link>
						<span className={styles.version}>Version {article.version}</span>
					</div>
					<h1>{article.title}</h1>
				</div>
				<Markdown className={styles.article_body} source={article.contents || "No additional details."}/>
			</article>
			<Link className={styles.back_link} href="/news"><FontAwesome prefix="fas" name="arrow-left"/> Back to news</Link>
		</div>
	</>;
}
