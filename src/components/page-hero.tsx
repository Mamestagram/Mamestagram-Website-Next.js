import Image from "next/image";
import styles from "@s/page-hero.module.css";

type PageHeroVariant = "documents" | "leaderboard" | "patcher" | "support";

type PageHeroProps = Readonly<{
	imageSrc: string;
	title: string;
	variant: PageHeroVariant;
}>;

export default function PageHero({ imageSrc, title, variant }: PageHeroProps) {
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
			</div>
		</section>
	);
}
