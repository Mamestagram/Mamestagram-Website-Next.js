import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/session";
import styles from "@s/auth.module.css";

export default async function AuthLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	const currentUser = await getCurrentUser();
	if (currentUser.isLoggedIn) redirect("/");
	
	return (
		<div className={styles.page}>
			<section className={styles.card} data-page-enter="box">
				{children}
			</section>
		</div>
	);
}
