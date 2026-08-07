"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";

export default function BannerImage() {
	const segment = usePathname().split("/").at(1) || "home"
	const bannerImages = ["home", "leaderboard", "documents"];
	if (bannerImages.includes(segment)) {
		return (
			<div className="banner">
				<Image src={`/images/banner/${segment}.jpg`} fill sizes="100vw" alt="" priority/>
			</div>
		);
	}
}
