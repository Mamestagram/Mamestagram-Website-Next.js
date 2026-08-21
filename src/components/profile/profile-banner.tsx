import Image from "next/image";
import styles from "@s/profile.module.css";

export default function ProfileBanner({ imageUrl }: Readonly<{ imageUrl: string | null }>) {
	return (
		<div className={styles.profile_cover} aria-hidden="true">
			{imageUrl
				? <Image className={styles.profile_cover_image}
				         src={imageUrl}
				         alt="Profile banner"
					         fill
					         sizes="100vw"
					         draggable={false}
					         loading="eager"/>
				: <div className={styles.profile_cover_fallback}/>}
			<div className={styles.profile_cover_overlay}/>
		</div>
	);
}
