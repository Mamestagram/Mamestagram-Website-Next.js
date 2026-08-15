import Image from "next/image";
import { getBadgeImageUrl } from "@/lib/badge";

export default function EquippedBadge({ badgeId, baseDomain, className, sizes, priority = false }: Readonly<{
	badgeId: number,
	baseDomain: string,
	className: string,
	sizes: string,
	priority?: boolean
}>) {
	if (!Number.isSafeInteger(badgeId) || badgeId < 1) return null;

	return (
		<span className={className} data-avatar-badge={badgeId} aria-hidden="true">
			<Image src={getBadgeImageUrl(badgeId, baseDomain)}
			       alt={`Badge ${badgeId}`}
			       fill
			       sizes={sizes}
			       crossOrigin="anonymous"
			       draggable={false}
			       priority={priority}/>
		</span>
	);
}
