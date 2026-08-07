import { redirect, notFound } from "next/navigation";
import { accountExists, getPreferredMode } from "@/database/profile";

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
		if (id >= (!isClan ? 3 : 1) && await accountExists(id, isClan)) {
			const preferredMode = await getPreferredMode(id, isClan);
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
