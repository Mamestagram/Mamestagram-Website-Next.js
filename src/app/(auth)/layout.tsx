import type { ReactNode } from "react";
import NameBodyHeader from "@/components/name-body-header";
import styles from "@s/auth.module.css";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<div className={styles.page}>
			<NameBodyHeader className="auth"/>
			<div className={styles.glow} aria-hidden="true"/>
			<section className={styles.card}>
				<div className={styles.visual} aria-hidden="true">
					<div className={styles.disc}>
						<span className={styles.disc_core}/>
						<span className={`${styles.hit} ${styles.hit_one}`}/>
						<span className={`${styles.hit} ${styles.hit_two}`}/>
						<span className={`${styles.hit} ${styles.hit_three}`}/>
					</div>
					<div className={styles.equalizer}>
						<span/><span/><span/><span/><span/><span/><span/><span/><span/>
					</div>
				</div>
				{children}
			</section>
		</div>
	);
}
