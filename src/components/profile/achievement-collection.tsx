import { Achievements } from "@/database/profile";
import { writeError } from "@/lib/log";
import { CollectionStatusDesc, CollectionType } from "@/app/api/medal_collection/route";
import Tooltip from "@/components/tooltip";
import MedalInfo from "./medal-info";
import CollectionMedals from "./collection-medals";
import styles from "@s/profile.module.css";

export default async function AchievementCollection({ achievements }: { achievements: Achievements }) {
	const apiUrl = `${process.env.BASE_URL}/api/medal_collection`;
	const api = await fetch(apiUrl);
	
	if (api.ok) {
		const collectionStatusDesc = await api.json() as CollectionStatusDesc;
		
		return (
			<ul className={styles.collection_status}>
				{collectionStatusDesc.map((medal, i) => {
					let collectedTotal: number, medalTotal: number;
					switch (medal.type) {
						case CollectionType.all:
							const skillCollected = achievements.skill.filter(({ isCollected }) => isCollected).length,
								modCollected = achievements.mod.filter(({ isCollected }) => isCollected).length,
								othersCollected = achievements.others.filter(({ isCollected }) => isCollected).length;
							const skillTotal = achievements.skill.length,
								modTotal = achievements.mod.length,
								othersTotal = achievements.others.length;
							collectedTotal = skillCollected + modCollected + othersCollected;
							medalTotal = skillTotal + modTotal + othersTotal;
							break;
						case CollectionType.skill:
							collectedTotal = achievements.skill.filter(({ isCollected }) => isCollected).length;
							medalTotal = achievements.skill.length;
							break;
						case CollectionType.mod:
							collectedTotal = achievements.mod.filter(({ isCollected }) => isCollected).length;
							medalTotal = achievements.mod.length;
							break;
						case CollectionType.others:
							collectedTotal = achievements.others.filter(({ isCollected }) => isCollected).length;
							medalTotal = achievements.others.length;
							break;
							
					}
					
					return (
						<li key={i}>
							<Tooltip className={styles.achv_img}
							         bubble
							         description={<MedalInfo name={medal.name}
							                                 description={medal.description}
							                                 condDescription={medal.condDescription}/>}>
								<CollectionMedals index={i} imgSrc={medal.imgSrc} collected={collectedTotal} total={medalTotal}/>
							</Tooltip>
							<p>{collectedTotal} / {medalTotal}</p>
							<p>{(collectedTotal / medalTotal * 100).toFixed(2)}%</p>
						</li>
					);
				})}
			</ul>
		);
	}
	else {
		writeError(`${api.status}: ${api.statusText} (${apiUrl})`).then();
		throw new Error(`Couldn't fetch description of collection status (status: ${api.status})`);
	}
}