import Image from "next/image";
import styles from "@s/page-hero.module.css";

type PageHeroVariant = "documents" | "leaderboard" | "patcher" | "support";

type PageHeroProps = Readonly<{
	description: string;
	imageSrc: string;
	title: string;
	variant: PageHeroVariant;
}>;

export default function PageHero({ description, imageSrc, title, variant }: PageHeroProps) {
	return (
		<section className={styles.hero} data-variant={variant}>
			<Image
				className={styles.image}
				src={imageSrc}
				alt={`${title} hero`}
				draggable={false}
				fill
				sizes="100vw"
				priority
			/>
			<div className={styles.overlay}></div>
			<div className={styles.content}>
				<h1>{title}</h1>
				<p>{description}</p>
			</div>
		</section>
	);
}
