import { notFound } from "next/navigation";
import { OsuMode } from "@/lib/mode";
import { writeLog } from "@/lib/log";

export default async function Profile({ params, searchParams }: {
	params: Promise<{
		id_param: string,
		mode_name: string
	}>,
	searchParams: Promise<{
		clan?: string,
		dans?: string
	}>
}) {
	const { id_param, mode_name } = await params;
	const { clan, dans } = await searchParams;
	const conds = [
		!isNaN(Number(id_param)) && Number(id_param) > 0,
		Object.values(OsuMode).includes(mode_name as OsuMode),
		clan === undefined || clan === "",
		dans === undefined || dans === ""
	];
	const queries = `(clan: ${clan}, dans: ${dans})`;
	writeLog("GET", `/leaderboard/${id_param}/${mode_name} ${queries}`).then();
	
	if (conds.every((cond) => cond)) {
		return <></>;
	}
	else {
		notFound();
	}
}