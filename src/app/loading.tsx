import Image from "next/image";
import styles from "@s/loading.module.css";

export default function Loading() {
	return (
		<section className={styles.screen}
		         role="status"
		         aria-busy="true"
		         aria-label="Loading page">
			<div className={styles.panel}>
				<span className={styles.logo_ring} aria-hidden="true">
					<Image className={styles.logo}
					       src="/images/logo.png"
					       alt="Mamestagram logo"
					       width={56}
					       height={56}
					       draggable={false}
					       priority/>
				</span>
				<span className={styles.label}>Loading...</span>
				<span className={styles.progress} aria-hidden="true"><i/></span>
			</div>
		</section>
	);
}
