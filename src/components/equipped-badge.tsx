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
			<Image src={`/api/profile-visual/profile/badge/${badge.id}`}
			       className={styles.image}
			       alt=""
			       fill
			       sizes={sizes}
			       draggable={false}
			       priority={priority}/>
		</span>
	);
}
