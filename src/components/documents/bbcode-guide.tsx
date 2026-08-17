import FontAwesome from "@/components/font-awesome";
import type { DocumentsData, Locale } from "@/app/api/documents/route";
import styles from "@s/documents.module.css";

export default function BbcodeGuide({
	locale,
	lead,
	sourceLabel,
	sourceHref,
	categories
}: Readonly<{
	locale: Locale,
	lead: string,
	sourceLabel: string,
	sourceHref: string,
	categories: DocumentsData["bbcodeCategories"]
}>) {
	return <>
		<p className={styles.section_lead}>{lead}</p>
		<div className={styles.bbcode_grid}>
			{categories.map((category) =>
				<article key={category.title.en} className={styles.bbcode_card} data-page-enter="box">
					<div className={styles.bbcode_card_heading}>
						<i><FontAwesome prefix="fad" name={category.icon}/></i>
						<span>
							<h3>{category.title[locale]}</h3>
							<p>{category.description[locale]}</p>
						</span>
					</div>
					<div className={styles.bbcode_examples}>
						{category.items.map((item) =>
							<div key={item.syntax}>
								<strong>{item.label[locale]}</strong>
								<code>{item.syntax}</code>
							</div>)}
					</div>
				</article>)}
		</div>
		<a className={styles.bbcode_source}
		   href={sourceHref}
		   target="_blank"
		   rel="noopener noreferrer">
			<FontAwesome prefix="fab" name="github"/>
			{sourceLabel}
			<FontAwesome prefix="fas" name="arrow-up-right"/>
		</a>
	</>;
}
