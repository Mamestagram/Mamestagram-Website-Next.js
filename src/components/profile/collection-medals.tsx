"use client";

import Image from "next/image";
import { useEffect } from "react";
import styles from "@s/profile.module.css";

export default function CollectionMedals({ index, imgSrc, collected, total }: {
	index: number,
	imgSrc: string,
	collected: number,
	total: number
}) {
	useEffect(() => {
		const coloredImg = document.querySelector(`.${styles.medal_container} ul li:nth-child(${index + 1}) .${styles.achv_img} img.${styles.colored}`) as HTMLElement;
		coloredImg.style.setProperty("--collected-ratio", `${collected / total * 100}%`);
	}, [collected, index, total]);
	
	return (
		<>
			<Image className={styles.glay} src={imgSrc}
			       alt="medal"
			       fill
			       draggable={false}
			       sizes="(max-width: 768px) 100vw, 50vw"/>
			<Image className={styles.colored}
			       src={imgSrc}
			       alt="medal"
			       fill
			       draggable={false}
			       sizes="(max-width: 768px) 100vw, 50vw"/>
		</>
	);
}