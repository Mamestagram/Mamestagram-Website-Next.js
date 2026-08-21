import Image from "next/image";
import type { ProfileBadge } from "@/lib/profile-cosmetics";
import styles from "@s/equipped-badge.module.css";

export default function EquippedBadge({ badge, sizes, priority = false }: Readonly<{
	badge: ProfileBadge | null,
	sizes: string,
	priority?: boolean
}>) {
	if (!badge) return null;

	return (
		<span className={styles.badge} data-avatar-badge={badge.id} aria-hidden="true">
			<Image src={badge.iconUrl}
			       className={styles.image}
			       alt={badge.name}
			       fill
			       sizes={sizes}
			       crossOrigin="anonymous"
			       draggable={false}
			       priority={priority}/>
		</span>
	);
}
