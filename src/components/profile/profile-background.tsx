import Image from "next/image";
import styles from "@s/profile.module.css";

export default function ProfileBackground({ imageUrl }: Readonly<{ imageUrl: string }>) {
	return (
		<div className={styles.profile_background} aria-hidden="true">
			<Image className={styles.profile_background_image}
			       src={imageUrl}
			       alt="Profile background"
			       fill
			       sizes="100vw"
			       draggable={false}/>
			<div className={styles.profile_background_overlay}/>
		</div>
	);
}
