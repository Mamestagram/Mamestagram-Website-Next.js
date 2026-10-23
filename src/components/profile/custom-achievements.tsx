import { getCustomAchievements, getCustomAchievementSettings } from "@/database/custom-achievements";
import CustomAchievementsCard from "@/components/profile/custom-achievements-card";
import CustomAchievementsEditor from "@/components/profile/custom-achievements-editor";

export default async function CustomAchievements({ id, canRevealSecretConditions, canEdit = false }: Readonly<{
	id: number;
	canRevealSecretConditions: boolean;
	canEdit?: boolean;
}>) {
	if (canEdit) {
		const settings = await getCustomAchievementSettings(id);
		return <CustomAchievementsEditor key={settings.selectedIds.join(",")} settings={settings}/>;
	}
	return <CustomAchievementsCard achievements={await getCustomAchievements(id)} canRevealSecretConditions={canRevealSecretConditions}/>;
}
