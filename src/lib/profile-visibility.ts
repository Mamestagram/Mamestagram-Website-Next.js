import type { UserInfo } from "@/components/context/user-provider";
import type { Profile } from "@/database/profile";
import { Priv } from "@/lib/priv";

export const canViewProfile = (
	profileId: number,
	isClan: boolean,
	profile: Pick<Profile, "isPrivate" | "ownerId">,
	viewer: UserInfo
) => {
	if (!profile.isPrivate) return true;
	if (!viewer.isLoggedIn || viewer.id === undefined) return false;

	const ownerId = isClan ? profile.ownerId : profileId;
	if (ownerId !== null && viewer.id === ownerId) return true;

	return viewer.priv !== undefined && (viewer.priv & Priv.staff) !== 0;
};
