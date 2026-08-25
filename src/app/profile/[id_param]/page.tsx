import { redirect, notFound } from "next/navigation";
import { getProfileRouteInfo } from "@/database/profile";
import { ModeNum, OsuMode } from "@/lib/mode";
import { canViewProfile } from "@/lib/profile-visibility";
import { getCurrentUser } from "@/lib/session";

export default async function OnlyId({ params, searchParams }: {
	params: Promise<{ id_param: string }>,
	searchParams: Promise<{ clan?: string }>
}) {
	const { id_param } = await params;
	const { clan } = await searchParams;
	const conds = [
		!isNaN(Number(id_param)) && Number(id_param) > 0,
		clan === undefined || clan === ""
	];
	
	if (conds.every((cond) => cond)) {
		const id = Number(id_param), isClan = clan !== undefined;
		if (id >= (!isClan ? 3 : 1)) {
			const [profile, currentUser] = await Promise.all([
				getProfileRouteInfo(id, isClan),
				getCurrentUser()
			]);
			if (!profile) notFound();
			
			const preferredMode = canViewProfile(id, isClan, profile, currentUser)
				? ModeNum[profile.preferredMode] as OsuMode
				: OsuMode.std;
			redirect(`${id}/${preferredMode}${isClan ? "?clan" : ""}`);
		}
		else {
			notFound();
		}
	}
	else {
		notFound();
	}
}
