import Image from "next/image";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { writeError } from "@/lib/log";
import { getCurrentUser } from "@/lib/session";
import styles from "@s/auth.module.css";

const getAuthImage = async (baseDomain: string) => {
	const imageUrl = `https://img.${baseDomain}/2`;
	try {
		const response = await fetch(imageUrl, {
			method: "HEAD",
			next: { revalidate: 300 },
			signal: AbortSignal.timeout(3000)
		});
		return response.ok && response.headers.get("content-type")?.startsWith("image/")
			? imageUrl
			: null;
	} catch (error: unknown) {
		void writeError(error);
		return null;
	}
};

export default async function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
	const currentUser = await getCurrentUser();
	if (currentUser.isLoggedIn) redirect("/");
	
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");
	const authImage = await getAuthImage(baseDomain);
	
	return (
		<div className={styles.page}>
			<div className={styles.page_image} aria-hidden="true">
				{authImage &&
					<Image src={authImage}
					       alt="Mamestagram authentication background"
					       fill
					       priority
					       sizes="100vw"
					       draggable={false}/>}
			</div>
			<div className={styles.glow} aria-hidden="true"/>
			<section className={styles.card} data-page-enter="box">
				<div className={styles.visual} aria-hidden="true">
					{authImage &&
						<Image className={styles.visual_image}
						       src={authImage}
						       alt="Mamestagram authentication artwork"
						       fill
						       sizes="(max-width: 760px) 100vw, 35vw"
						       draggable={false}/>}
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
