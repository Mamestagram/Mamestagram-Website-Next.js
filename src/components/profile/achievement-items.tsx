import classNames from "classnames";
import Image from "next/image";
import { JSX } from "react";
import { Medal } from "@/database/profile";
import Tooltip from "@/components/tooltip";
import MedalInfo from "./medal-info";
import styles from "@s/profile.module.css";

export default function AchievementItems({ userId, medals }: {
	userId: number,
	medals: Medal[]
}) {
	return (
		<ul>
			{medals.map((medal) => {
				let imgSrc: string, medalInfoCmp: JSX.Element | null;
				if (!(/^hide-/).test(medal.filename) || medal.isCollected) {
					// imgSrc = `https://assets.${process.env.BASE_DOMAIN}/medals/client/${medal.filename}@2x.png`;
					imgSrc = `https://assets.mamesosu.net/medals/client/${medal.filename}@2x.png`;
					medalInfoCmp =
						<MedalInfo userId={userId}
						           name={medal.name}
						           filename={medal.filename}
						           description={medal.description}
						           condDescription={medal.condDescription}/>;
				}
				else {
					imgSrc = "/images/medals/secret.png";
					medalInfoCmp = null;
				}
				
				return (
					<li key={medal.id}
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