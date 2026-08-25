import classNames from "classnames";
import Image from "next/image";
import type { JSX } from "react";
import type { Medal } from "@/database/profile";
import Tooltip from "@/components/tooltip";
import MedalInfo from "./medal-info";
import styles from "@s/profile.module.css";

export default function AchievementItems({ medals, canRevealSecretConditions }: Readonly<{
	medals: Medal[],
	canRevealSecretConditions: boolean
}>) {
	return (
		<ul>
			{medals.map((medal) => {
				let imgSrc: string, medalInfoCmp: JSX.Element | null;
				const isSecret = /^hide-/.test(medal.filename);
				if (!isSecret || medal.isCollected) {
					// imgSrc = `https://assets.${process.env.BASE_DOMAIN}/medals/client/${medal.filename}@2x.png`; // TODO
					imgSrc = `https://assets.mamesosu.net/medals/client/${medal.filename}@2x.png`;
					medalInfoCmp =
						<MedalInfo name={medal.name}
						           description={medal.description}
						           condDescription={medal.condDescription}
						           showCondition={!isSecret || canRevealSecretConditions}/>;
				}
				else {
					imgSrc = "/images/medals/secret.png";
					medalInfoCmp = null;
				}
				
				return (
					<li key={medal.id}
					    data-rendering-item="square"
					    className={classNames({ [styles.unachieved]: !medal.isCollected })}>
						<Tooltip className={styles.achv_img} bubble description={medalInfoCmp}>
							<Image src={imgSrc}
							       alt="medal"
							       fill
							       draggable={false}
							       sizes="(max-width: 768px) 100vw, 50vw"/>
						</Tooltip>
					</li>
				);
			})}
		</ul>
	);
}
