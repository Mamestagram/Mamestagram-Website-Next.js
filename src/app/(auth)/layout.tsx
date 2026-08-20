import Image from "next/image";
import type { ReactNode } from "react";
import styles from "@s/auth.module.css";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");
	const authImage = `https://img.${baseDomain}/2`;

	return (
		<div className={styles.page}>
			<div className={styles.page_image} aria-hidden="true">
				<Image src={authImage}
				       alt="Mamestagram authentication background"
				       fill
				       priority
				       sizes="100vw"
				       draggable={false}/>
			</div>
			<div className={styles.glow} aria-hidden="true"/>
			<section className={styles.card} data-page-enter="box">
				<div className={styles.visual} aria-hidden="true">
					<Image className={styles.visual_image}
					       src={authImage}
					       alt="Mamestagram authentication artwork"
					       fill
					       priority
						       sizes="(max-width: 760px) 100vw, 35vw"
						       draggable={false}/>
					<div className={styles.visual_shade}/>
					<div className={styles.equalizer}>
						<span/><span/><span/><span/><span/><span/><span/><span/><span/>
					</div>
				</div>
				{children}
			</section>
		</div>
	);
}
