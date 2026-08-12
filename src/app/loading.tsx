import Image from "next/image";
import styles from "@s/loading.module.css";

export default function Loading() {
	return (
		<section className={styles.screen}
		         role="status"
		         aria-busy="true"
		         aria-label="Loading page">
			<div className={styles.panel}>
				<div className={styles.logo} aria-hidden="true">
					<span/>
					<Image src="/images/logo.png"
					       alt=""
					       width={64}
					       height={64}
					       priority/>
				</div>
				<div className={styles.copy}>
					<strong>Mamestagram</strong>
					<p>Loading page...</p>
				</div>
				<span className={styles.progress} aria-hidden="true"><i/></span>
				<span className={styles.dots} aria-hidden="true"><i/><i/><i/></span>
			</div>
		</section>
	);
}
