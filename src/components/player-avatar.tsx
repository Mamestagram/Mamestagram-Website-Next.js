import Image from "next/image";
import classNames from "classnames";
import EquippedBadge from "@/components/equipped-badge";
import type { ProfileCosmetics } from "@/lib/profile-cosmetics";
import styles from "@s/player-avatar.module.css";

export default function PlayerAvatar({
	userId,
	name,
	baseDomain,
	cosmetics = null,
	className,
	sizes,
	imageSize = "default",
	priority = false
}: Readonly<{
	userId: number,
	name: string,
	baseDomain: string,
	cosmetics?: ProfileCosmetics | null,
	className?: string,
	sizes: string,
	imageSize?: "default" | "compact",
	priority?: boolean
}>) {
	return (
		<span className={classNames(styles.container, className)} data-image-size={imageSize}>
			<span className={styles.avatar_surface}>
				<Image src={`https://a.${baseDomain}/${userId}`}
				       className={styles.avatar}
				       alt={`${name}'s avatar`}
				       width={256}
				       height={256}
				       sizes={sizes}
				       draggable={false}
				       priority={priority}/>
			</span>
			{cosmetics?.frame && <Image src={cosmetics.frame.imageUrl}
			                                  className={styles.frame}
			                                  alt={cosmetics.frame.name}
			                                  width={256}
			                                  height={256}
			                                  sizes={sizes}
			                                  crossOrigin="anonymous"
			                                  draggable={false}
			                                  priority={priority}/>}
			<EquippedBadge badge={cosmetics?.badge ?? null} sizes={sizes} priority={priority}/>
		</span>
	);
}
