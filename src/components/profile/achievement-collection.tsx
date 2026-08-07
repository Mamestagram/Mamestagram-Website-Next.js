import { CollectionType, type CollectionStatusDesc } from "@/app/api/medal_collection/route";
import CollectionMedals from "@/components/profile/collection-medals";
import MedalInfo from "@/components/profile/medal-info";
import Tooltip from "@/components/tooltip";
import type { Achievements } from "@/database/profile";
import { fetchInternalJson } from "@/lib/fetch-json";
import styles from "@s/profile.module.css";

type AchievementGroup = "skill" | "mod" | "others";

const achievementGroups: readonly AchievementGroup[] = ["skill", "mod", "others"];

const getGroupProgress = (achievements: Achievements, group: AchievementGroup) => ({
	collected: achievements[group].filter(({ isCollected }) => isCollected).length,
	total: achievements[group].length
});

const getCollectionProgress = (achievements: Achievements, type: CollectionType) => {
	if (type === CollectionType.all) {
		return achievementGroups.reduce((progress, group) => {
			const groupProgress = getGroupProgress(achievements, group);
			return {
				collected: progress.collected + groupProgress.collected,
				total: progress.total + groupProgress.total
			};
		}, { collected: 0, total: 0 });
	}

	const groupByType: Partial<Record<CollectionType, AchievementGroup>> = {
		[CollectionType.skill]: "skill",
		[CollectionType.mod]: "mod",
		[CollectionType.others]: "others"
	};
	const group = groupByType[type];
	return group ? getGroupProgress(achievements, group) : { collected: 0, total: 0 };
};

export default async function AchievementCollection({ achievements }: Readonly<{ achievements: Achievements }>) {
	const collectionDescriptions = await fetchInternalJson<CollectionStatusDesc>("/api/medal_collection");

	return (
		<ul className={styles.collection_status}>
			{collectionDescriptions.map((medal) => {
				const { collected, total } = getCollectionProgress(achievements, medal.type);
				const percentage = total > 0 ? collected / total * 100 : 0;

				return (
					<li key={medal.type}>
						<Tooltip className={styles.achv_img}
						         bubble
						         description={
							         <MedalInfo name={medal.name}
							                    description={medal.description}
							                    condDescription={medal.condDescription}/>
						         }>
							<CollectionMedals imgSrc={medal.imgSrc}
							                  collected={collected}
							                  total={total}/>
						</Tooltip>
						<p>{collected} / {total}</p>
						<p>{percentage.toFixed(2)}%</p>
					</li>
				);
			})}
		</ul>
	);
}
