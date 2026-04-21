import { redirect, notFound } from "next/navigation";
import { getPreferredMode } from "@/database/profile";

export default async function OnlyId({ params, searchParams }: {
	params: Promise<{ id: string }>,
	searchParams: Promise<{ clan?: string }>
}) {
	const { id } = await params;
	const { clan } = await searchParams,
		isClan = clan !== undefined && clan === "";
	if (!isNaN(Number(id)) && Number(id) >= (!isClan ? 3 : 1)) {
		const userId = Number(id);
		const preferredMode = await getPreferredMode(userId, isClan);
		if (preferredMode !== undefined)
			redirect(`${userId}/${preferredMode}${isClan ? "?clan" : ""}`);
		else
			notFound();
	}
	else {
		notFound();
	}
}