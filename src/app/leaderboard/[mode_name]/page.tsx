import { redirect, notFound } from "next/navigation";
import { OsuMode } from "@/lib/mode";

export default async function ModeName({ params }: { params: Promise<{ mode_name: string }> }) {
	const { mode_name } = await params;
	if (Object.values(OsuMode).includes(mode_name as OsuMode))
		redirect(`${mode_name}/performance`);
	else
		notFound();
}