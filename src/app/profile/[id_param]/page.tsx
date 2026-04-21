import { redirect, notFound } from "next/navigation";
import { getPreferredMode } from "@/database/profile";

export default async function OnlyId({ params, searchParams }: {
	params: Promise<{ id_param: string }>,
	searchParams: Promise<{ clan?: string }>
}) {
	const { id_param } = await params;
	const { clan } = await searchParams,
		isClan = clan !== undefined && clan === "";
	if (!isNaN(Number(id_param)) && Number(id_param) >= (!isClan ? 3 : 1)) {
		const id = Number(id_param);
		const preferredMode = await getPreferredMode(id, isClan);
		if (preferredMode !== undefined)
			redirect(`${id}/${preferredMode}${isClan ? "?clan" : ""}`);
		else
			notFound();
	}
	else {
		notFound();
	}
}