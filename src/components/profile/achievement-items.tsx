import classNames from "classnames";
import Image from "next/image";
import { CollectStatus, Medal } from "@/database/profile";
import Tooltip from "@/components/tooltip";
import MedalInfo from "@/components/profile/medal-info";
import styles from "@s/profile.module.css";

export default function AchievementItems({ medals, collectStatus }: {
	medals: Medal[];
	collectStatus: CollectStatus[];
}) {
	return (
		<>
			{medals.map((medal) =>
				<li key={medal.id}
				    className={classNames({
					    [styles.unachieved]: collectStatus.some(({ achId, isCollected }) => achId === medal.id && !isCollected)
					})}>
					<Tooltip className={styles.achv_img} bubble description={<MedalInfo medal={medal}/>}>
						{/*<Image src={`https://assets.${process.env.BASE_DOMAIN}/medals/client/${medal.filename}@2x.png`}
						       alt="medal"
						       fill
						       draggable={false}
						       sizes="(max-width: 768px) 100vw, 50vw"/>*/}
						<Image src={`https://assets.mamesosu.net/medals/client/${medal.filename}@2x.png`}
						       alt="medal"
						       fill
						       draggable={false}
						       sizes="(max-width: 768px) 100vw, 50vw"/>
					</Tooltip>
				</li>
			)}
		</>
	);
}